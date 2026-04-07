import { defineStore } from 'pinia'
import type { TrainingAction, Player } from '@/types/game.types'
import { useTeamStore } from './team'

interface TrainingState {
    weeklyPlan: Record<string, TrainingAction>
}

export const useTrainingStore = defineStore('training', {
    state: (): TrainingState => ({
        weeklyPlan: {},
    }),

    actions: {
        setAction(playerId: string, action: TrainingAction) {
            this.weeklyPlan[playerId] = action
        },

        clearPlan() {
            this.weeklyPlan = {}
        },

        executeWeek(): { budgetDelta: number } {
            const teamStore = useTeamStore()
            let budgetDelta = 0

            for (const player of teamStore.roster) {
                const action = this.weeklyPlan[player.id]
                if (!action) continue

                const updated = { ...player, stats: { ...player.stats }, champPool: player.champPool.map(c => ({ ...c })) }

                switch (action.type) {
                    case 'trainFarm': {
                        updated.stats.farm = Math.min(10, updated.stats.farm + 0.2)
                        updated.fatigue = Math.min(100, updated.fatigue + 10)
                        // Apply coach bonus
                        if (teamStore.coach?.bonus.farmEarlyBonus) {
                            // bonus already applied in simulation, no stat change here
                        }
                        break
                    }
                    case 'trainMechanics': {
                        let bonus = 0.2
                        if (teamStore.coach?.bonus.mechanicsTrainBonus) {
                            bonus += teamStore.coach.bonus.mechanicsTrainBonus
                        }
                        updated.stats.mechanics = Math.min(10, updated.stats.mechanics + bonus)
                        updated.fatigue = Math.min(100, updated.fatigue + 10)
                        break
                    }
                    case 'trainTeamfight': {
                        updated.stats.teamfight = Math.min(10, updated.stats.teamfight + 0.2)
                        updated.fatigue = Math.min(100, updated.fatigue + 10)
                        break
                    }
                    case 'studyChampion': {
                        const champIdx = updated.champPool.findIndex(c => c.championId === action.championId)
                        const gain = 5 + Math.floor(Math.random() * 6) // 5-10
                        if (champIdx >= 0) {
                            updated.champPool[champIdx].knowledge = Math.min(100, updated.champPool[champIdx].knowledge + gain)
                        } else {
                            updated.champPool.push({ championId: action.championId, knowledge: gain })
                        }
                        updated.fatigue = Math.min(100, updated.fatigue + 5)
                        break
                    }
                    case 'stream': {
                        const earnings = Math.floor(500 + (player.popularity / 100) * 1500)
                        budgetDelta += earnings
                        updated.fatigue = Math.max(0, updated.fatigue - 5)
                        updated.popularity = Math.min(100, updated.popularity + 5)
                        break
                    }
                    case 'rest': {
                        const moralDecayReduction = teamStore.coach?.bonus.moralDecayReduction ?? 0
                        updated.fatigue = Math.max(0, updated.fatigue - 20)
                        updated.moral = Math.min(100, updated.moral + 5 * (1 + moralDecayReduction))
                        break
                    }
                }

                // Natural moral decay based on fatigue
                const moralDecayReduction = teamStore.coach?.bonus.moralDecayReduction ?? 0
                if (action.type !== 'rest') {
                    const decayAmount = (updated.fatigue / 200) * (1 - moralDecayReduction)
                    updated.moral = Math.max(0, updated.moral - decayAmount * 5)
                }

                teamStore.updateRosterPlayer(updated as Player)
            }

            if (budgetDelta !== 0) {
                teamStore.addBudget(budgetDelta)
            }

            this.clearPlan()
            return { budgetDelta }
        },
    },
})
