import { defineStore } from 'pinia'
import type { Match, TournamentState } from '@/types/game.types'
import { AI_TEAMS } from '@/data/teams'
import { loadFromStorage, saveToStorage } from '@/utils/storage'

const SAVE_KEY = 'cblow-tournament-save'

// ─── helpers ────────────────────────────────────────────────────────────────

function fillSlot(match: Match, team: string) {
    if (match.teamA === 'TBD') match.teamA = team
    else match.teamB = team
}

function roundMatches(matches: Match[], bracket: Match['bracket'], round: number): Match[] {
    return matches.filter(m => m.bracket === bracket && m.round === round)
}

function posInRound(matches: Match[], match: Match): number {
    return roundMatches(matches, match.bracket, match.round).findIndex(m => m.id === match.id)
}

function fillInRound(matches: Match[], bracket: Match['bracket'], round: number, idx: number, team: string) {
    const target = roundMatches(matches, bracket, round)[idx]
    if (target) fillSlot(target, team)
}

function fillById(matches: Match[], id: string, team: string) {
    const target = matches.find(m => m.id === id)
    if (target) fillSlot(target, team)
}

function makeMatches(
    bracket: Match['bracket'],
    round: number,
    format: Match['format'],
    count: number,
    teams: Array<[string, string]> = []
): Match[] {
    return Array.from({ length: count }, (_, i) => ({
        id: bracket === 'grand_final' ? 'grand_final' : `${bracket === 'winners' ? 'wb' : 'lb'}_r${round}_${i}`,
        teamA: teams[i]?.[0] ?? 'TBD',
        teamB: teams[i]?.[1] ?? 'TBD',
        format,
        bracket,
        round,
    }))
}

// ─── store ──────────────────────────────────────────────────────────────────

export const useTournamentStore = defineStore('tournament', {
    state: (): TournamentState => {
        const saved = loadFromStorage<TournamentState>(SAVE_KEY)
        return {
            matches: saved.matches ?? [],
            currentMatchId: saved.currentMatchId ?? null,
            playerTeamId: saved.playerTeamId ?? 'player',
            eliminated: saved.eliminated ?? [],
            week: saved.week ?? 1,
        }
    },

    getters: {
        currentMatch(state): Match | null {
            return state.matches.find(m => m.id === state.currentMatchId) ?? null
        },

        playerCurrentOpponent(state): string | null {
            const match = state.matches.find(
                m => !m.winner && (m.teamA === state.playerTeamId || m.teamB === state.playerTeamId)
            )
            if (!match) return null
            return match.teamA === state.playerTeamId ? match.teamB : match.teamA
        },

        isPlayerEliminated(state): boolean {
            return state.eliminated.includes(state.playerTeamId)
        },

        hasPlayerWon(state): boolean {
            return state.matches.find(m => m.bracket === 'grand_final')?.winner === state.playerTeamId
        },

        pendingMatches(state): Match[] {
            return state.matches.filter(m => !m.winner)
        },

        playerNextMatch(state): Match | null {
            return state.matches.find(
                m => !m.winner && (m.teamA === state.playerTeamId || m.teamB === state.playerTeamId)
            ) ?? null
        },
    },

    actions: {
        initTournament(playerTeamId: string, selectedAITeamIds: string[]) {
            this.playerTeamId = playerTeamId
            this.eliminated = []
            this.week = 1

            const shuffled = [playerTeamId, ...selectedAITeamIds].sort(() => Math.random() - 0.5)
            const pairs = (arr: string[]): Array<[string, string]> =>
                Array.from({ length: arr.length / 2 }, (_, i) => [arr[i * 2], arr[i * 2 + 1]])

            this.matches = [
                // Winners bracket
                ...makeMatches('winners', 1, 'bo3', 4, pairs(shuffled)),
                ...makeMatches('winners', 2, 'bo3', 2),
                { id: 'wb_final', teamA: 'TBD', teamB: 'TBD', format: 'bo5', bracket: 'winners', round: 3 },
                // Losers bracket
                ...makeMatches('losers', 1, 'bo3', 4),
                ...makeMatches('losers', 2, 'bo3', 2),
                ...makeMatches('losers', 3, 'bo3', 2),
                { id: 'lb_final', teamA: 'TBD', teamB: 'TBD', format: 'bo5', bracket: 'losers', round: 4 },
                // Grand Final
                { id: 'grand_final', teamA: 'TBD', teamB: 'TBD', format: 'bo5', bracket: 'grand_final', round: 5 },
            ]

            const playerMatch = this.matches.find(
                m => m.teamA === playerTeamId || m.teamB === playerTeamId
            )
            this.currentMatchId = playerMatch?.id ?? null
            this._save()
        },

        recordMatchResult(matchId: string, winner: string) {
            const match = this.matches.find(m => m.id === matchId)
            if (!match) return

            match.winner = winner
            const loser = match.teamA === winner ? match.teamB : match.teamA
            this._propagate(match, winner, loser)
            this._save()
        },

        _propagate(match: Match, winner: string, loser: string) {
            const pos = posInRound(this.matches, match)

            if (match.bracket === 'grand_final') {
                this.eliminated.push(loser)
                return
            }

            if (match.bracket === 'losers') {
                this.eliminated.push(loser)
            }

            type Route = (team: string) => void

            const routes: Record<string, { w: Route; l?: Route }> = {
                winners_1: {
                    w: t => fillInRound(this.matches, 'winners', 2, Math.floor(pos / 2), t),
                    l: t => fillInRound(this.matches, 'losers',  1, pos, t),
                },
                winners_2: {
                    w: t => fillById(this.matches, 'wb_final', t),
                    l: t => fillInRound(this.matches, 'losers', 3, pos, t),
                },
                winners_3: {
                    w: t => fillById(this.matches, 'grand_final', t),
                    l: t => fillById(this.matches, 'lb_final', t),
                },
                losers_1: { w: t => fillInRound(this.matches, 'losers', 2, Math.floor(pos / 2), t) },
                losers_2: { w: t => fillInRound(this.matches, 'losers', 3, pos, t) },
                losers_3: { w: t => fillById(this.matches, 'lb_final', t) },
                losers_4: { w: t => fillById(this.matches, 'grand_final', t) },
            }

            const route = routes[`${match.bracket}_${match.round}`]
            route?.w(winner)
            route?.l?.(loser)
        },

        simulateAIMatches() {
            const pending = this.matches.filter(m =>
                !m.winner &&
                m.teamA !== 'TBD' && m.teamB !== 'TBD' &&
                m.teamA !== this.playerTeamId && m.teamB !== this.playerTeamId
            )

            for (const match of pending) {
                const winner = Math.random() < 0.5 ? match.teamA : match.teamB
                const loser = winner === match.teamA ? match.teamB : match.teamA
                match.winner = winner
                this._propagate(match, winner, loser)
            }
            this._save()
        },

        setCurrentMatch(matchId: string) {
            this.currentMatchId = matchId
            this._save()
        },

        advanceWeek() {
            this.week++
            this._save()
        },

        reset() {
            this.matches = []
            this.currentMatchId = null
            this.playerTeamId = 'player'
            this.eliminated = []
            this.week = 1
            this._save()
        },

        _save() {
            saveToStorage(SAVE_KEY, {
                matches: this.matches,
                currentMatchId: this.currentMatchId,
                playerTeamId: this.playerTeamId,
                eliminated: this.eliminated,
                week: this.week,
            })
        },
    },
})
