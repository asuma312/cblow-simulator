import type {
    Player, Coach, GameEvent, GameEventMeta, SimulationResult,
    TeamState, PlayerState, CombatResult, Role, TeamTowers,
} from '@/types/game.types'
import { ROLES } from '@/types/game.types'
import {
    TOTAL_TURNS, DRAGON_TURNS, BARON_TURN, BARON_DURATION,
    TOWER_GOLD, KILL_GOLD, ASSIST_GOLD_SHARE, ASSIST_WINDOW, PLAYER_HP, RESPAWN,
    ROLE_WEIGHTS,
    ROLE_POSITIONS, BASE_POSITIONS, COMBAT_RANGE, WALK_SPEED, DAMAGE_SCALE,
    ROLE_LANE, attackCooldown,
} from './constants'
import { rand, randInt, stepToward } from './helpers'
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

function snapshotPositions(p: TeamState, o: TeamState) {
    return {
        player:   p.playerStates.map(ps => ({ ...ps.position })),
        opponent: o.playerStates.map(ps => ({ ...ps.position })),
    }
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

function inRange(a: PlayerState, b: PlayerState): boolean {
    const dx = a.position.x - b.position.x
    const dy = a.position.y - b.position.y
    return dx * dx + dy * dy <= COMBAT_RANGE * COMBAT_RANGE
}

function damageRoll(ps: PlayerState, targetPs: PlayerState): number {
    const w = ROLE_WEIGHTS[ps.player.role]
    const base = ps.player.stats.farm * w.farm
               + ps.player.stats.teamfight * w.teamfight
    return rand(0.5, 1.5) * base
        * ps.knowledgeMult * ps.fatigueMult * ps.moralMult
        * getMatchupMult(ps.pickedChampionId, ps.player.role, targetPs.pickedChampionId)
}

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

    // Assist tracking: victim → lista de {atacante, turno}
    const damageLog = new Map<PlayerState, { attackerPs: PlayerState; turn: number }[]>()

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
            towerSnapshot:    snapshotTowers(playerTeam, opponentTeam),
            goldSnapshot:     { player: playerTeam.totalGold, opponent: opponentTeam.totalGold },
            positionSnapshot: snapshotPositions(playerTeam, opponentTeam),
        })
    }

    function resolveKill(
        killerPs: PlayerState,
        victimPs: PlayerState,
        turn: number,
        killerIsPlayer: boolean,
    ): void {
        killerPs.gold += KILL_GOLD

        // Assist gold: units que causaram dano nos últimos ASSIST_WINDOW turnos
        const assistGold = Math.floor(KILL_GOLD * ASSIST_GOLD_SHARE)
        const assisters = new Set(
            (damageLog.get(victimPs) ?? [])
                .filter(e => e.turn >= turn - ASSIST_WINDOW && e.attackerPs !== killerPs)
                .map(e => e.attackerPs)
        )
        for (const a of assisters) a.gold += assistGold
        damageLog.delete(victimPs)

        victimPs.deadUntilTurn = turn + RESPAWN
        victimPs.hp = PLAYER_HP
        const victimIsPlayer = !killerIsPlayer
        victimPs.position    = { ...BASE_POSITIONS[victimIsPlayer ? 'player' : 'opponent'] }
        victimPs.atkCooldown = attackCooldown(victimPs.player.stats.mechanics)
        if (killerIsPlayer) killCount.player++
        else killCount.opponent++
    }

    for (let turn = 1; turn <= TOTAL_TURNS; turn++) {
        farmTick(playerTeam,   turn)
        farmTick(opponentTeam, turn)

        // ── Step posições ──────────────────────────────────────────────────
        for (const [team, side] of [[playerTeam, 'player'], [opponentTeam, 'opponent']] as const) {
            for (const ps of team.playerStates) {
                if (!alive(ps)) continue
                ps.position = stepToward(ps.position, ROLE_POSITIONS[ps.player.role][side], WALK_SPEED)
            }
        }

        // ── Decrement cooldowns ────────────────────────────────────────────
        for (const ps of [...playerTeam.playerStates, ...opponentTeam.playerStates]) {
            if (alive(ps) && ps.atkCooldown > 0) ps.atkCooldown--
        }

        const combats: CombatResult[] = []
        let turnAdvDelta = 0
        let hasKill = false
        let hasTowerDestroyed = false
        let towerDesc = ''
        let killDesc = ''

        const pAll = playerTeam.playerStates
        const oAll = opponentTeam.playerStates

        // ── Combate por proximidade ────────────────────────────────────────
        for (const atkPs of [...pAll, ...oAll]) {
            if (!alive(atkPs) || atkPs.atkCooldown > 0) continue
            const isPlayer = pAll.includes(atkPs)
            const enemies  = isPlayer ? oAll : pAll
            const inRangeEnemies = enemies.filter(e => alive(e) && inRange(atkPs, e))
            if (!inRangeEnemies.length) continue

            const targetPs = inRangeEnemies[randInt(0, inRangeEnemies.length - 1)]
            atkPs.atkCooldown = attackCooldown(atkPs.player.stats.mechanics)

            const damage = damageRoll(atkPs, targetPs) * DAMAGE_SCALE
            targetPs.hp -= damage

            let killed = false
            let goldGained = 0

            if (targetPs.hp <= 0) {
                resolveKill(atkPs, targetPs, turn, isPlayer)
                goldGained = KILL_GOLD
                killed = true
                hasKill = true
                turnAdvDelta += (isPlayer ? 1 : -1) * randInt(4, 8)
                killDesc = isPlayer
                    ? `${atkPs.player.nickname} abate ${targetPs.player.nickname}!`
                    : `${atkPs.player.nickname} abate ${targetPs.player.nickname} — pressão do adversário!`
            } else {
                const log = damageLog.get(targetPs) ?? []
                log.push({ attackerPs: atkPs, turn })
                damageLog.set(targetPs, log)
            }

            combats.push({
                attackerRole: atkPs.player.role,
                defenderRole: targetPs.player.role,
                attackerIsPlayer: isPlayer,
                damage,
                killedDefender: killed,
                goldGained,
            })
        }

        // ── Torre hits ─────────────────────────────────────────────────────
        for (const [units, defTeam, sign] of [
            [pAll, opponentTeam,  1],
            [oAll, playerTeam,   -1],
        ] as [PlayerState[], TeamState, number][]) {
            for (const atkPs of units) {
                if (!alive(atkPs) || atkPs.atkCooldown > 0) continue
                const lane = ROLE_LANE[atkPs.player.role]
                if (!lane) continue
                const enemies = sign > 0 ? oAll : pAll
                if (enemies.some(e => alive(e) && inRange(atkPs, e))) continue
                const r = hitTower(atkPs, defTeam, lane)
                if (r.destroyed) {
                    hasTowerDestroyed = true
                    if (!towerDesc) towerDesc = sign > 0
                        ? `TORRE DESTRUÍDA! ${atkPs.player.nickname} derruba a ${r.whichTower === 'outer' ? 'torre externa' : 'torre interna'} da ${lane.toUpperCase()}!`
                        : `TORRE DESTRUÍDA! Adversário derruba a ${r.whichTower === 'outer' ? 'torre externa' : 'torre interna'} da ${lane.toUpperCase()}!`
                    turnAdvDelta += sign * 12
                }
            }
        }

        updateGoldMultiplier(playerTeam)
        updateGoldMultiplier(opponentTeam)

        // ── Tower victory ──────────────────────────────────────────────────

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

        // ── Objectives ─────────────────────────────────────────────────────

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

        // ── Decrement baron ────────────────────────────────────────────────

        for (const p of [...playerTeam.playerStates, ...opponentTeam.playerStates]) {
            if (p.baronActive && --p.baronTurnsRemaining <= 0) p.baronActive = false
        }

        // ── Turn event ─────────────────────────────────────────────────────

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
