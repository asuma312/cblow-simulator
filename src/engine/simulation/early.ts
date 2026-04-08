import type { Coach, GameEvent, GameEventMeta, GameEventType, TeamState, PlayerState, CombatResult, Role } from '@/types/game.types'
import { ROLES } from '@/types/game.types'
import { EARLY_TURNS, PLAYER_HP, KILL_GOLD, RESPAWN, ROLE_WEIGHTS } from './constants'
import { rand, randInt } from './helpers'
import { farmTick, updateGoldMultiplier } from './state'

export function runEarlyGame(
    playerTeam: TeamState,
    opponentTeam: TeamState,
    _coach: Coach | null | undefined,
    events: GameEvent[],
    metas: GameEventMeta[],
): { kills: { player: number; opponent: number } } {
    const kills = { player: 0, opponent: 0 }

    for (let turn = 1; turn <= EARLY_TURNS; turn++) {
        farmTick(playerTeam, turn)
        farmTick(opponentTeam, turn)

        const combats: CombatResult[] = []
        let turnAdvDelta = 0
        let hasKill = false

        // 1v1 para top e mid
        for (const role of ['top', 'mid'] as Role[]) {
            const ri = ROLES.indexOf(role)
            const atkP = playerTeam.playerStates[ri]
            const defP = opponentTeam.playerStates[ri]

            const pDead = atkP.deadUntilTurn !== null && turn < atkP.deadUntilTurn
            const oDead = defP.deadUntilTurn !== null && turn < defP.deadUntilTurn
            if (pDead || oDead) continue

            const w = ROLE_WEIGHTS[role]
            const rollPlayer = rand(0.5, 1.5) * (
                atkP.player.stats.mechanics * w.mechanics +
                atkP.player.stats.farm * w.farm
            ) * atkP.knowledgeMult * atkP.fatigueMult * atkP.moralMult

            const rollOpponent = rand(0.5, 1.5) * (
                defP.player.stats.mechanics * w.mechanics +
                defP.player.stats.farm * w.farm
            ) * defP.knowledgeMult * defP.fatigueMult * defP.moralMult

            const playerAttacks = rollPlayer > rollOpponent
            const attackerRoll = playerAttacks ? rollPlayer : rollOpponent
            const defenderRoll = playerAttacks ? rollOpponent : rollPlayer
            const damage = Math.max(0, (attackerRoll - defenderRoll) * 5)

            if (damage === 0) continue

            const attackerIsPlayer = playerAttacks
            const defenderState = playerAttacks ? defP : atkP
            defenderState.hp -= damage

            let killed = false
            let goldGained = 0
            if (defenderState.hp <= 0) {
                killed = true
                defenderState.deadUntilTurn = turn + RESPAWN
                defenderState.hp = PLAYER_HP
                const attackerState = playerAttacks ? atkP : defP
                attackerState.gold += KILL_GOLD
                goldGained = KILL_GOLD
                if (attackerIsPlayer) kills.player++
                else kills.opponent++
                hasKill = true
                const sign = attackerIsPlayer ? 1 : -1
                turnAdvDelta += sign * randInt(4, 8)
            }

            combats.push({ attackerRole: role, defenderRole: role, attackerIsPlayer, damage, killedDefender: killed, goldGained })
        }

        // jungle: sem combate no early game

        // 2v2 bot lane (adc + support)
        let botLaneKillDesc: string | null = null
        {
            const adcRi = ROLES.indexOf('adc')
            const supRi = ROLES.indexOf('support')
            const pAdc = playerTeam.playerStates[adcRi]
            const pSup = playerTeam.playerStates[supRi]
            const oAdc = opponentTeam.playerStates[adcRi]
            const oSup = opponentTeam.playerStates[supRi]

            const pAdcAlive = !(pAdc.deadUntilTurn !== null && turn < pAdc.deadUntilTurn)
            const pSupAlive = !(pSup.deadUntilTurn !== null && turn < pSup.deadUntilTurn)
            const oAdcAlive = !(oAdc.deadUntilTurn !== null && turn < oAdc.deadUntilTurn)
            const oSupAlive = !(oSup.deadUntilTurn !== null && turn < oSup.deadUntilTurn)

            const rollPs = (ps: PlayerState): number => {
                const w = ROLE_WEIGHTS[ps.player.role]
                return rand(0.5, 1.5) * (
                    ps.player.stats.mechanics * w.mechanics +
                    ps.player.stats.farm * w.farm +
                    ps.player.stats.teamfight * w.teamfight
                ) * ps.knowledgeMult * ps.fatigueMult * ps.moralMult
            }

            const playerBotRoll = (pAdcAlive ? rollPs(pAdc) : 0) + (pSupAlive ? rollPs(pSup) : 0)
            const opponentBotRoll = (oAdcAlive ? rollPs(oAdc) : 0) + (oSupAlive ? rollPs(oSup) : 0)

            if ((pAdcAlive || pSupAlive) && (oAdcAlive || oSupAlive)) {
                const damage = Math.max(0, Math.abs(playerBotRoll - opponentBotRoll) * 5)

                if (damage > 0) {
                    const attackerIsPlayer = playerBotRoll > opponentBotRoll

                    let targetState: PlayerState
                    let defenderRole: Role
                    if (attackerIsPlayer) {
                        if (oAdcAlive && oSupAlive) {
                            const pickAdc = Math.random() < 0.5
                            targetState = pickAdc ? oAdc : oSup
                            defenderRole = pickAdc ? 'adc' : 'support'
                        } else {
                            targetState = oAdcAlive ? oAdc : oSup
                            defenderRole = oAdcAlive ? 'adc' : 'support'
                        }
                    } else {
                        if (pAdcAlive && pSupAlive) {
                            const pickAdc = Math.random() < 0.5
                            targetState = pickAdc ? pAdc : pSup
                            defenderRole = pickAdc ? 'adc' : 'support'
                        } else {
                            targetState = pAdcAlive ? pAdc : pSup
                            defenderRole = pAdcAlive ? 'adc' : 'support'
                        }
                    }

                    targetState.hp -= damage

                    let killed = false
                    let goldGained = 0
                    if (targetState.hp <= 0) {
                        killed = true
                        targetState.deadUntilTurn = turn + RESPAWN
                        targetState.hp = PLAYER_HP

                        const winnerAdc = attackerIsPlayer ? pAdc : oAdc
                        winnerAdc.gold += KILL_GOLD
                        goldGained = KILL_GOLD
                        if (attackerIsPlayer) kills.player++
                        else kills.opponent++
                        hasKill = true
                        const sign = attackerIsPlayer ? 1 : -1
                        turnAdvDelta += sign * randInt(4, 8)

                        const targetNick = defenderRole === 'adc'
                            ? (attackerIsPlayer ? oAdc.player.nickname : pAdc.player.nickname)
                            : (attackerIsPlayer ? oSup.player.nickname : pSup.player.nickname)
                        const atkAdcNick = attackerIsPlayer ? pAdc.player.nickname : oAdc.player.nickname
                        const atkSupNick = attackerIsPlayer ? pSup.player.nickname : oSup.player.nickname

                        botLaneKillDesc = attackerIsPlayer
                            ? `${atkAdcNick} e ${atkSupNick} abateram ${targetNick} na bot lane!`
                            : `${atkAdcNick} e ${atkSupNick} sofrem pressão — ${targetNick} cai!`
                    }

                    combats.push({ attackerRole: 'adc', defenderRole, attackerIsPlayer, damage, killedDefender: killed, goldGained })
                }
            }
        }

        updateGoldMultiplier(playerTeam)
        updateGoldMultiplier(opponentTeam)

        const minute = turn * 2
        const type: GameEventType = hasKill ? 'kill' : 'turn_summary'
        const dominantKill = combats.find(c => c.killedDefender)

        let desc: string
        if (botLaneKillDesc) {
            desc = botLaneKillDesc
        } else if (dominantKill) {
            const atkNick = dominantKill.attackerIsPlayer
                ? playerTeam.playerStates[ROLES.indexOf(dominantKill.attackerRole)].player.nickname
                : opponentTeam.playerStates[ROLES.indexOf(dominantKill.attackerRole)].player.nickname
            const defNick = dominantKill.attackerIsPlayer
                ? opponentTeam.playerStates[ROLES.indexOf(dominantKill.defenderRole)].player.nickname
                : playerTeam.playerStates[ROLES.indexOf(dominantKill.defenderRole)].player.nickname
            desc = dominantKill.attackerIsPlayer
                ? `${atkNick} abate ${defNick} na ${dominantKill.attackerRole.toUpperCase()} lane!`
                : `${atkNick} abate ${defNick} — pressão do adversário!`
        } else {
            desc = `Turno ${turn}: farm intenso, nenhum abate`
        }

        events.push({ minute, description: desc, advantageDelta: turnAdvDelta })
        metas.push({ type, phase: 'early', turnNumber: turn, combats })
    }

    return { kills }
}
