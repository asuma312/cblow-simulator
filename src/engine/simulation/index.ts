import type {
    Player, Coach, GameEvent, GameEventMeta, SimulationResult,
    TeamState, PlayerState, CombatResult, Role, TeamTowers,
} from '@/types/game.types'
import { ROLES } from '@/types/game.types'
import {
    TOTAL_TURNS, DRAGON_TURNS, BARON_TURN, BARON_DURATION,
    TOWER_GOLD, KILL_GOLD, PLAYER_HP, RESPAWN,
    ROLE_WEIGHTS, ASSIST_GOLD_SHARE,
} from './constants'
import { rand, randInt } from './helpers'
import { initTeamState, farmTick, teamfightPower, updateGoldMultiplier } from './state'
import { getMatchupMult } from './matchups'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const alive = (ps: PlayerState): boolean => ps.deadUntilTurn === null

function snapshotTowers(p: TeamState, o: TeamState): { player: TeamTowers; opponent: TeamTowers } {
    const snap = (t: TeamState): TeamTowers => ({
        top: { ...t.towers.top }, mid: { ...t.towers.mid }, bot: { ...t.towers.bot },
    })
    return { player: snap(p), opponent: snap(o) }
}

function hitTower(
    attackerPs: PlayerState,
    defendingTeam: TeamState,
    lane: 'top' | 'mid' | 'bot',
): { destroyed: boolean; whichTower: 'outer' | 'inner' } {
    const ls = defendingTeam.towers[lane]
    if (ls.outer > 0) {
        ls.outer--
        if (ls.outer === 0) attackerPs.gold += TOWER_GOLD
        return { destroyed: ls.outer === 0, whichTower: 'outer' }
    } else if (ls.inner > 0) {
        ls.inner--
        if (ls.inner === 0) attackerPs.gold += TOWER_GOLD
        return { destroyed: ls.inner === 0, whichTower: 'inner' }
    }
    return { destroyed: false, whichTower: 'outer' }
}

function countDestroyedTowers(team: TeamState): number {
    return (['top', 'mid', 'bot'] as const).reduce((n, lane) =>
        n + (team.towers[lane].outer === 0 ? 1 : 0) + (team.towers[lane].inner === 0 ? 1 : 0), 0)
}

function rollPs(ps: PlayerState, oPs: PlayerState, withTeamfight = false): number {
    const w = ROLE_WEIGHTS[ps.player.role]
    const base = ps.player.stats.mechanics * w.mechanics
               + ps.player.stats.farm * w.farm
               + (withTeamfight ? ps.player.stats.teamfight * w.teamfight : 0)
    return rand(0.5, 1.5) * base
        * ps.knowledgeMult * ps.fatigueMult * ps.moralMult
        * getMatchupMult(ps.pickedChampionId, ps.player.role, oPs.pickedChampionId)
}

const ADC_IDX = ROLES.indexOf('adc')
const SUP_IDX = ROLES.indexOf('support')

// ─── Main ─────────────────────────────────────────────────────────────────────

export function simulateGame(
    playerRoster: Player[],
    opponentRoster: Player[],
    playerPicks: Record<string, string>,
    opponentPicks: Record<string, string>,
    _coach?: Coach | null,
): SimulationResult {
    const playerTeam   = initTeamState('player',   playerRoster,   playerPicks)
    const opponentTeam = initTeamState('opponent', opponentRoster, opponentPicks)

    const events: GameEvent[]    = []
    const metas: GameEventMeta[] = []

    let finalWinner: 'player' | 'opponent' = 'player'
    let nexusDestroyed = false
    const killCount  = { player: 0, opponent: 0 }
    const dragonWins = { player: 0, opponent: 0 }
    let baronWinner: 'player' | 'opponent' | null = null

    function addEvent(
        type: GameEventMeta['type'],
        description: string,
        advantageDelta: number,
        turn: number,
        combats: CombatResult[] = [],
    ): void {
        events.push({ minute: turn, description, advantageDelta })
        metas.push({
            type, phase: 'game', turnNumber: turn, combats,
            towerSnapshot: snapshotTowers(playerTeam, opponentTeam),
            goldSnapshot:  { player: playerTeam.totalGold, opponent: opponentTeam.totalGold },
        })
    }

    function resolveKill(
        killerPs: PlayerState,
        assisterPs: PlayerState | null,
        victimPs: PlayerState,
        turn: number,
        killerIsPlayer: boolean,
    ): { goldGained: number; assistGoldGained: number } {
        killerPs.gold += KILL_GOLD
        let assistGoldGained = 0
        if (assisterPs) {
            assistGoldGained = Math.floor(KILL_GOLD * ASSIST_GOLD_SHARE)
            assisterPs.gold += assistGoldGained
        }
        victimPs.deadUntilTurn = turn + RESPAWN
        victimPs.hp = PLAYER_HP
        if (killerIsPlayer) killCount.player++
        else killCount.opponent++
        return { goldGained: KILL_GOLD, assistGoldGained }
    }

    for (let turn = 1; turn <= TOTAL_TURNS; turn++) {
        farmTick(playerTeam,   turn)
        farmTick(opponentTeam, turn)

        const combats: CombatResult[] = []
        let turnAdvDelta = 0
        let hasKill = false
        let hasTowerDestroyed = false
        let towerDesc = ''
        let killDesc = ''

        // ── Top & Mid (1v1) ───────────────────────────────────────────────

        for (const lane of ['top', 'mid'] as const) {
            const ri  = ROLES.indexOf(lane)
            const pPs = playerTeam.playerStates[ri]
            const oPs = opponentTeam.playerStates[ri]
            const pAlive = alive(pPs)
            const oAlive = alive(oPs)

            if (pAlive && oAlive) {
                const rollP = rollPs(pPs, oPs)
                const rollO = rollPs(oPs, pPs)
                const playerAttacks = rollP > rollO
                const winnerRoll = Math.max(rollP, rollO)
                const loserRoll  = Math.min(rollP, rollO)
                const atkPs = playerAttacks ? pPs : oPs
                const defPs = playerAttacks ? oPs : pPs
                const damage = winnerRoll * 4
                defPs.hp -= damage

                let killed = false
                let goldGained = 0
                let counterDamage: number | undefined

                if (defPs.hp <= 0) {
                    goldGained = resolveKill(atkPs, null, defPs, turn, playerAttacks).goldGained
                    killed = true
                    hasKill = true
                    turnAdvDelta += (playerAttacks ? 1 : -1) * randInt(4, 8)
                    killDesc = playerAttacks
                        ? `${atkPs.player.nickname} abate ${defPs.player.nickname} na ${lane.toUpperCase()} lane!`
                        : `${atkPs.player.nickname} abate ${defPs.player.nickname} — pressão do adversário!`
                } else {
                    counterDamage = loserRoll * 2
                    atkPs.hp -= counterDamage
                }

                combats.push({ attackerRole: lane, defenderRole: lane, attackerIsPlayer: playerAttacks, damage, killedDefender: killed, goldGained, counterDamage })
            } else if (pAlive !== oAlive) {
                const atkPs   = pAlive ? pPs : oPs
                const defTeam = pAlive ? opponentTeam : playerTeam
                const sign    = pAlive ? 1 : -1
                const r = hitTower(atkPs, defTeam, lane)
                if (r.destroyed) {
                    hasTowerDestroyed = true
                    towerDesc = sign > 0
                        ? `TORRE DESTRUÍDA! ${atkPs.player.nickname} derruba a ${r.whichTower === 'outer' ? 'torre externa' : 'torre interna'} da ${lane.toUpperCase()}!`
                        : `TORRE DESTRUÍDA! Adversário derruba a ${r.whichTower === 'outer' ? 'torre externa' : 'torre interna'} da ${lane.toUpperCase()}!`
                    turnAdvDelta += sign * 12
                }
            }
        }

        // ── Bot (2v2) ─────────────────────────────────────────────────────

        {
            const pAdc = playerTeam.playerStates[ADC_IDX]
            const pSup = playerTeam.playerStates[SUP_IDX]
            const oAdc = opponentTeam.playerStates[ADC_IDX]
            const oSup = opponentTeam.playerStates[SUP_IDX]

            const pAdcRoll = alive(pAdc) ? rollPs(pAdc, oAdc, true) : 0
            const pSupRoll = alive(pSup) ? rollPs(pSup, oSup, true) : 0
            const oAdcRoll = alive(oAdc) ? rollPs(oAdc, pAdc, true) : 0
            const oSupRoll = alive(oSup) ? rollPs(oSup, pSup, true) : 0

            const pBotRoll = pAdcRoll + pSupRoll
            const oBotRoll = oAdcRoll + oSupRoll

            if ((alive(pAdc) || alive(pSup)) && (alive(oAdc) || alive(oSup))) {
                const attackerIsPlayer = pBotRoll > oBotRoll
                const winnerRoll = Math.max(pBotRoll, oBotRoll)
                const loserRoll  = Math.min(pBotRoll, oBotRoll)
                const [aAdc, aSup, aAdcRoll, aSupRoll, dAdc, dSup] = attackerIsPlayer
                    ? [pAdc, pSup, pAdcRoll, pSupRoll, oAdc, oSup]
                    : [oAdc, oSup, oAdcRoll, oSupRoll, pAdc, pSup]

                const pickAdc      = alive(dAdc) && (!alive(dSup) || Math.random() < 0.5)
                const targetPs     = pickAdc ? dAdc : dSup
                const defenderRole: Role = pickAdc ? 'adc' : 'support'
                const damage       = winnerRoll * 4
                targetPs.hp -= damage

                let killed = false
                let goldGained = 0
                let assistGoldGained = 0
                let assistantRole: Role | undefined
                let assisterPs: PlayerState | null = null
                let counterDamage: number | undefined

                if (targetPs.hp <= 0) {
                    const killerIsAdc = aAdcRoll >= aSupRoll
                    const killerPs  = killerIsAdc ? aAdc : aSup
                    const otherPs   = killerIsAdc ? aSup : aAdc
                    const otherRoll = killerIsAdc ? aSupRoll : aAdcRoll
                    if (alive(otherPs) && otherRoll > 0) {
                        assisterPs    = otherPs
                        assistantRole = killerIsAdc ? 'support' : 'adc'
                    }
                    const r = resolveKill(killerPs, assisterPs, targetPs, turn, attackerIsPlayer)
                    killed = true
                    goldGained = r.goldGained
                    assistGoldGained = r.assistGoldGained
                    hasKill = true
                    turnAdvDelta += (attackerIsPlayer ? 1 : -1) * randInt(4, 8)
                    killDesc = attackerIsPlayer
                        ? `${aAdc.player.nickname} e ${aSup.player.nickname} abateram ${targetPs.player.nickname} na bot lane!`
                        : `${aAdc.player.nickname} e ${aSup.player.nickname} sofrem pressão — ${targetPs.player.nickname} cai!`
                } else {
                    counterDamage = loserRoll * 2
                    const counterTarget = alive(aAdc) && (!alive(aSup) || Math.random() < 0.5) ? aAdc : aSup
                    counterTarget.hp -= counterDamage
                }

                combats.push({
                    attackerRole: 'adc', defenderRole, attackerIsPlayer, damage, killedDefender: killed, goldGained, counterDamage,
                    ...(assisterPs ? { assistantRole, assistantIsPlayer: attackerIsPlayer, assistGoldGained } : {}),
                })
            }

            // Tower hits: each player hits when their direct counterpart is dead
            for (const [atkPs, cntPs, defTeam, sign] of [
                [pAdc, oAdc, opponentTeam,  1],
                [pSup, oSup, opponentTeam,  1],
                [oAdc, pAdc, playerTeam,   -1],
                [oSup, pSup, playerTeam,   -1],
            ] as [PlayerState, PlayerState, TeamState, number][]) {
                if (alive(atkPs) && !alive(cntPs)) {
                    const r = hitTower(atkPs, defTeam, 'bot')
                    if (r.destroyed) {
                        hasTowerDestroyed = true
                        if (!towerDesc) towerDesc = sign > 0
                            ? `TORRE DESTRUÍDA! ${atkPs.player.nickname} derruba a torre da BOT!`
                            : `TORRE DESTRUÍDA! Adversário derruba a torre da BOT!`
                        turnAdvDelta += sign * 12
                    }
                }
            }
        }

        updateGoldMultiplier(playerTeam)
        updateGoldMultiplier(opponentTeam)

        // ── Tower victory ─────────────────────────────────────────────────

        if (countDestroyedTowers(opponentTeam) === 6) {
            finalWinner = 'player'; nexusDestroyed = true
            addEvent('tower_destroyed', `Turno ${turn}: NEXUS! Seu time destrói todas as torres!`, 20, turn, combats)
            break
        }
        if (countDestroyedTowers(playerTeam) === 6) {
            finalWinner = 'opponent'; nexusDestroyed = true
            addEvent('tower_destroyed', `Turno ${turn}: NEXUS! Adversário destrói todas as torres!`, -20, turn, combats)
            break
        }

        // ── Objectives ────────────────────────────────────────────────────

        if (DRAGON_TURNS.includes(turn)) {
            const winner: 'player' | 'opponent' = teamfightPower(playerTeam, 0.4, 0.6) >= teamfightPower(opponentTeam, 0.4, 0.6) ? 'player' : 'opponent'
            const winTeam = winner === 'player' ? playerTeam : opponentTeam
            winTeam.dragonCount++
            for (const p of winTeam.playerStates) p.dragonStacks++
            if (winner === 'player') dragonWins.player++
            else dragonWins.opponent++
            const dragonNum = dragonWins.player + dragonWins.opponent
            const advDelta  = winner === 'player' ? (dragonNum === 2 ? 12 : 8) : (dragonNum === 2 ? -12 : -8)
            addEvent('dragon', winner === 'player'
                ? `Dragão ${dragonNum}! Seu time controla o objetivo.`
                : `Adversário pega o Dragão ${dragonNum}!`,
                advDelta, turn)
            continue
        }

        if (turn === BARON_TURN) {
            baronWinner = teamfightPower(playerTeam, 0.3, 0.7) >= teamfightPower(opponentTeam, 0.3, 0.7) ? 'player' : 'opponent'
            for (const p of (baronWinner === 'player' ? playerTeam : opponentTeam).playerStates) {
                p.baronActive = true
                p.baronTurnsRemaining = BARON_DURATION
            }
            addEvent('baron', baronWinner === 'player'
                ? `BARON! Seu time toma o Baron Nashor!`
                : `BARON! Adversário pega o Baron Nashor!`,
                baronWinner === 'player' ? 15 : -15, turn)
            continue
        }

        // ── Decrement baron ───────────────────────────────────────────────

        for (const p of [...playerTeam.playerStates, ...opponentTeam.playerStates]) {
            if (p.baronActive && --p.baronTurnsRemaining <= 0) p.baronActive = false
        }

        // ── Turn event ────────────────────────────────────────────────────

        if (hasTowerDestroyed)   addEvent('tower_destroyed', towerDesc, turnAdvDelta, turn, combats)
        else if (hasKill)        addEvent('kill',            killDesc,  turnAdvDelta, turn, combats)
        else                     addEvent('turn_summary', `Turno ${turn}: farm intenso, nenhum abate`, 0, turn, combats)
    }

    // ── Post-60 winner ────────────────────────────────────────────────────────

    if (!nexusDestroyed) {
        const pD = countDestroyedTowers(opponentTeam)
        const oD = countDestroyedTowers(playerTeam)
        finalWinner = pD !== oD
            ? (pD > oD ? 'player' : 'opponent')
            : (playerTeam.totalGold >= opponentTeam.totalGold ? 'player' : 'opponent')
    }

    // ── Result ────────────────────────────────────────────────────────────────

    return {
        winner: finalWinner,
        events,
        eventMeta: metas,
        finalGold:   { player: playerTeam.totalGold,   opponent: opponentTeam.totalGold },
        finalKills:  killCount,
        dragonWins,
        baronWinner,
        finalTowers: snapshotTowers(playerTeam, opponentTeam),
        stats: {
            player:   { kills: killCount.player,   deaths: killCount.opponent, gold: Math.round(playerTeam.totalGold),   towers: countDestroyedTowers(opponentTeam) },
            opponent: { kills: killCount.opponent, deaths: killCount.player,   gold: Math.round(opponentTeam.totalGold), towers: countDestroyedTowers(playerTeam)   },
        },
    }
}
