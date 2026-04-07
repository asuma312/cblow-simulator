import { defineStore } from 'pinia'
import type { GameState } from '@/types/game.types'
import { loadFromStorage, saveToStorage } from '@/utils/storage'

const SAVE_KEY = 'cblow-game-save'

export const useGameStore = defineStore('game', {
    state: (): GameState => {
        const saved = loadFromStorage<GameState>(SAVE_KEY)
        return {
            phase: saved.phase ?? 'setup',
            budget: saved.budget ?? 10000,
            week: saved.week ?? 1,
            currentMatchId: saved.currentMatchId ?? null,
            currentGameInSeries: saved.currentGameInSeries ?? 1,
            seriesScores: saved.seriesScores ?? { player: 0, opponent: 0 },
        }
    },

    getters: {
        isPlayerAhead(state): boolean {
            return state.seriesScores.player > state.seriesScores.opponent
        },

        isSeriesOver(state): (format: 'bo3' | 'bo5') => boolean {
            return (format) => {
                const n = format === 'bo3' ? 2 : 3
                return state.seriesScores.player >= n || state.seriesScores.opponent >= n
            }
        },

        playerWonSeries(state): (format: 'bo3' | 'bo5') => boolean {
            return (format) => {
                const n = format === 'bo3' ? 2 : 3
                return state.seriesScores.player >= n
            }
        },
    },

    actions: {
        setPhase(phase: GameState['phase']) {
            this.phase = phase
            this._save()
        },

        advancePhase() {
            const order: GameState['phase'][] = [
                'setup', 'training', 'champselect', 'gameplay', 'tournament'
            ]
            const idx = order.indexOf(this.phase)
            if (idx >= 0 && idx < order.length - 1) {
                this.phase = order[idx + 1]
                this._save()
            }
        },

        startMatch(matchId: string) {
            this.currentMatchId = matchId
            this.currentGameInSeries = 1
            this.seriesScores = { player: 0, opponent: 0 }
            this.phase = 'champselect'
            this._save()
        },

        recordGameResult(winner: 'player' | 'opponent') {
            if (winner === 'player') this.seriesScores.player++
            else this.seriesScores.opponent++
            this.currentGameInSeries++
            this._save()
        },

        advanceWeek() {
            this.week++
            this._save()
        },

        reset() {
            this.phase = 'setup'
            this.budget = 10000
            this.week = 1
            this.currentMatchId = null
            this.currentGameInSeries = 1
            this.seriesScores = { player: 0, opponent: 0 }
            this._save()
        },

        _save() {
            saveToStorage(SAVE_KEY, {
                phase: this.phase,
                budget: this.budget,
                week: this.week,
                currentMatchId: this.currentMatchId,
                currentGameInSeries: this.currentGameInSeries,
                seriesScores: this.seriesScores,
            })
        },
    },
})
