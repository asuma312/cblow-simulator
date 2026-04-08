import type { GameEvent, GameEventMeta, TeamState } from '@/types/game.types'
import { EARLY_TURNS, MID_TURNS, MID_DRAGON_TURNS, MID_BARON_TURN, BARON_DURATION } from './constants'
import { farmTick, teamfightPower } from './state'

export function runMidGame(
    playerTeam: TeamState,
    opponentTeam: TeamState,
    events: GameEvent[],
    metas: GameEventMeta[],
): { dragonWins: { player: number; opponent: number }; baronWinner: 'player' | 'opponent' | null } {
    const dragonWins = { player: 0, opponent: 0 }
    let baronWinner: 'player' | 'opponent' | null = null

    // Reset HP at mid-game start
    for (const ps of [...playerTeam.playerStates, ...opponentTeam.playerStates]) {
        ps.hp = 100
        ps.deadUntilTurn = null
    }

    for (let turn = 1; turn <= MID_TURNS; turn++) {
        farmTick(playerTeam, turn)
        farmTick(opponentTeam, turn)

        const minute = EARLY_TURNS * 2 + turn * 1.5

        // Dragon spawns
        if (MID_DRAGON_TURNS.includes(turn)) {
            const pPow = teamfightPower(playerTeam, 0.4, 0.6)
            const oPow = teamfightPower(opponentTeam, 0.4, 0.6)
            const winner: 'player' | 'opponent' = pPow >= oPow ? 'player' : 'opponent'
            const winTeam = winner === 'player' ? playerTeam : opponentTeam
            winTeam.dragonCount++
            for (const ps of winTeam.playerStates) ps.dragonStacks++

            if (winner === 'player') dragonWins.player++
            else dragonWins.opponent++

            const dragonNum = dragonWins.player + dragonWins.opponent
            const advDelta = winner === 'player' ? (dragonNum === 2 ? 12 : 8) : (dragonNum === 2 ? -12 : -8)
            const desc = winner === 'player'
                ? `Dragão ${dragonNum}! Seu time controla o objetivo.`
                : `Adversário pega o Dragão ${dragonNum}!`

            events.push({ minute: Math.round(minute), description: desc, advantageDelta: advDelta })
            metas.push({ type: 'dragon', phase: 'mid', turnNumber: turn, objectiveWinner: winner })
            continue
        }

        // Baron spawn
        if (turn === MID_BARON_TURN) {
            const pPow = teamfightPower(playerTeam, 0.3, 0.7)
            const oPow = teamfightPower(opponentTeam, 0.3, 0.7)
            baronWinner = pPow >= oPow ? 'player' : 'opponent'
            const winTeam = baronWinner === 'player' ? playerTeam : opponentTeam
            winTeam.baronActive = true
            winTeam.baronTurnsRemaining = BARON_DURATION

            const advDelta = baronWinner === 'player' ? 15 : -15
            const desc = baronWinner === 'player'
                ? `BARON! Seu time toma o Baron Nashor!`
                : `BARON! Adversário pega o Baron Nashor!`

            events.push({ minute: Math.round(minute), description: desc, advantageDelta: advDelta })
            metas.push({ type: 'baron', phase: 'mid', turnNumber: turn, objectiveWinner: baronWinner })
            continue
        }

        // Normal farm turn
        events.push({
            minute: Math.round(minute),
            description: `Mid game turno ${turn}: ambos os times empurram`,
            advantageDelta: 0,
        })
        metas.push({
            type: 'turn_summary', phase: 'mid', turnNumber: turn,
            goldSnapshot: { player: playerTeam.totalGold, opponent: opponentTeam.totalGold },
        })
    }

    return { dragonWins, baronWinner }
}
