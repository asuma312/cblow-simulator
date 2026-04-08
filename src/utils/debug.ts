/**
 * Debug helpers — only registered in development mode.
 * Usage no console do DevTools:
 *   __debugGameplay()          → partida aleatória bo3
 *   __debugGameplay('bo5')     → partida bo5
 */

import type { Router } from 'vue-router'
import type { Pinia } from 'pinia'
import { useTeamStore } from '@/stores/team'
import { useGameStore } from '@/stores/game'
import { useTournamentStore } from '@/stores/tournament'
import { useChampionsStore } from '@/stores/champions'
import { ALL_PLAYERS, getPlayersByRole } from '@/data/players/index'
import { AI_TEAMS } from '@/data/teams/index'
import { COACHES } from '@/data/coaches/index'
import { ROLES } from '@/types/game.types'
import type { MatchFormat } from '@/types/game.types'

// Champions razoavelmente conhecidos para picks de debug
const DEBUG_CHAMPS = [
    'Garen', 'Darius', 'Malphite', 'Irelia', 'Fiora',     // top
    'Vi', 'LeeSin', 'Amumu', 'Hecarim', 'Graves',          // jgl
    'Ahri', 'Zed', 'Orianna', 'Syndra', 'Viktor',          // mid
    'Jinx', 'Caitlyn', 'Ashe', 'Jhin', 'Ezreal',           // adc
    'Thresh', 'Lulu', 'Nautilus', 'Blitzcrank', 'Soraka',  // sup
]

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function shuffled<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5)
}

function randomChamp(used: Set<string>): string {
    const pool = shuffled(DEBUG_CHAMPS).filter(c => !used.has(c))
    const pick = pool[0] ?? `Garen${Math.random().toFixed(2)}`
    used.add(pick)
    return pick
}

export function registerDebugHelpers(pinia: Pinia, router: Router) {
    const w = window as unknown as Record<string, unknown>

    w.__debugGameplay = (format: MatchFormat = 'bo3') => {
        const teamStore       = useTeamStore(pinia)
        const gameStore       = useGameStore(pinia)
        const tournamentStore = useTournamentStore(pinia)
        const champStore      = useChampionsStore(pinia)

        // ── 1. Time do player ──────────────────────────────────────────────
        teamStore.teamName = 'DEBUG FC'
        teamStore.coach    = COACHES[0]

        // Um jogador aleatório por role
        teamStore.roster = []
        for (const role of ROLES) {
            const byRole = getPlayersByRole(role)
            teamStore.addPlayer(pickRandom(byRole))
        }

        // ── 2. Time oponente (AI) ──────────────────────────────────────────
        const aiTeam = pickRandom(AI_TEAMS)
        // Sempre popula o roster (pode estar vazio se o draft não ocorreu)
        aiTeam.roster = ROLES.map(role => {
            const byRole = ALL_PLAYERS.filter(p => p.role === role)
            return pickRandom(byRole)
        })

        // ── 3. Torneio: cria match fake ────────────────────────────────────
        const matchId = 'debug_match'
        tournamentStore.matches = [{
            id: matchId,
            teamA: 'player',
            teamB: aiTeam.id,
            format,
            bracket: 'winners',
            round: 1,
        }]
        tournamentStore.currentMatchId = matchId
        tournamentStore.playerTeamId   = 'player'
        tournamentStore.eliminated     = []

        // ── 4. Picks do champion select ────────────────────────────────────
        champStore.resetDraft()
        champStore.playerSide = 'blue'

        const used = new Set<string>()
        // blue = player (top jgl mid adc sup), red = opponent
        const bluePicks  = ROLES.map(() => randomChamp(used))
        const redPicks   = ROLES.map(() => randomChamp(used))

        champStore.picks.blue = bluePicks.map(c  => ({ name: c, image: `/champions/${c}.png` }))
        champStore.picks.red  = redPicks.map(c   => ({ name: c, image: `/champions/${c}.png` }))
        champStore.draftStep  = 20 // marca draft como completo

        // ── 5. Estado do jogo ──────────────────────────────────────────────
        gameStore.phase                = 'gameplay'
        gameStore.currentMatchId       = matchId
        gameStore.currentGameInSeries  = 1
        gameStore.seriesScores         = { player: 0, opponent: 0 }

        console.log(`[DEBUG] Partida ${format.toUpperCase()} iniciada`)
        console.log(`  Player: ${teamStore.teamName} vs ${aiTeam.name}`)
        console.log(`  Blue (player): ${bluePicks.join(', ')}`)
        console.log(`  Red  (opp):    ${redPicks.join(', ')}`)

        router.push('/gameplay')
    }

    console.log(
        '%c[CBlow Debug] %c__debugGameplay() %cdisponível',
        'color:#C8860A;font-weight:bold',
        'color:#22d3ee;font-family:monospace',
        'color:gray',
    )
}
