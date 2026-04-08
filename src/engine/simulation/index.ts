import type { Player, Coach, GameEvent, GameEventMeta, PhaseResult, SimulationResult, TeamGameStats } from '@/types/game.types'
import { EARLY_TURNS, MID_TURNS, ROLE_WEIGHTS } from './constants'
import { initTeamState } from './state'
import { runEarlyGame } from './early'
import { runMidGame } from './mid'
import { runLateGame } from './late'

function generateStats(power: number, isWinner: boolean): TeamGameStats {
    const base = power * 2
    return {
        kills:  Math.round(base * (0.8 + Math.random() * 0.4)) + (isWinner ? 3 : 0),
        deaths: Math.round(base * (0.5 + Math.random() * 0.5)) - (isWinner ? 2 : 0),
        gold:   Math.round(40000 + power * 3000 + Math.random() * 5000) + (isWinner ? 8000 : 0),
        towers: Math.floor(Math.random() * 5) + (isWinner ? 4 : 0),
    }
}

export function simulateGame(
    playerRoster: Player[],
    opponentRoster: Player[],
    playerPicks: Record<string, string>,
    opponentPicks: Record<string, string>,
    coach?: Coach | null,
): SimulationResult {
    const playerTeam = initTeamState('player', playerRoster, playerPicks)
    const opponentTeam = initTeamState('opponent', opponentRoster, opponentPicks)

    const events: GameEvent[] = []
    const metas: GameEventMeta[] = []
    const phases: PhaseResult[] = []

    function addPhaseHeader(phase: 'early' | 'mid' | 'late', label: string, minute: number) {
        events.push({ minute, description: `— ${label} —`, advantageDelta: 0 })
        metas.push({ type: 'phase_header', phase })
    }

    addPhaseHeader('early', 'EARLY GAME', 0)
    const { kills } = runEarlyGame(playerTeam, opponentTeam, coach, events, metas)
    phases.push({ phase: 'early' })

    addPhaseHeader('mid', 'MID GAME', EARLY_TURNS * 2 + 1)
    const { dragonWins, baronWinner } = runMidGame(playerTeam, opponentTeam, events, metas)
    phases.push({ phase: 'mid' })

    addPhaseHeader('late', 'LATE GAME', Math.round(EARLY_TURNS * 2 + MID_TURNS * 1.5) + 1)
    const winner = runLateGame(playerTeam, opponentTeam, events, metas)
    phases.push({ phase: 'late', winner })

    const playerPow = playerTeam.playerStates.reduce((s, ps) => {
        const w = ROLE_WEIGHTS[ps.player.role]
        return s + ps.player.stats.farm * w.farm + ps.player.stats.mechanics * w.mechanics + ps.player.stats.teamfight * w.teamfight
    }, 0) / playerTeam.playerStates.length

    const opponentPow = opponentTeam.playerStates.reduce((s, ps) => {
        const w = ROLE_WEIGHTS[ps.player.role]
        return s + ps.player.stats.farm * w.farm + ps.player.stats.mechanics * w.mechanics + ps.player.stats.teamfight * w.teamfight
    }, 0) / opponentTeam.playerStates.length

    return {
        winner,
        events,
        eventMeta: metas,
        phases,
        finalGold: { player: playerTeam.totalGold, opponent: opponentTeam.totalGold },
        finalKills: kills,
        dragonWins,
        baronWinner,
        stats: {
            player: generateStats(playerPow, winner === 'player'),
            opponent: generateStats(opponentPow, winner === 'opponent'),
        },
    }
}
