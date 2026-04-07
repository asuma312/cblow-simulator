import { defineStore } from 'pinia'
import type { Player, Coach } from '@/types/game.types'
import { loadFromStorage, saveToStorage } from '@/utils/storage'

const SAVE_KEY = 'cblow-save'

interface TeamState {
    teamName: string
    coach: Coach | null
    roster: Player[]
    budget: number
}

export const useTeamStore = defineStore('team', {
    state: (): TeamState => {
        const saved = loadFromStorage<TeamState>(SAVE_KEY)
        return {
            teamName: saved.teamName ?? '',
            coach: saved.coach ?? null,
            roster: saved.roster ?? [],
            budget: saved.budget ?? 10000,
        }
    },

    getters: {
        totalSalary(state): number {
            return state.roster.reduce((sum, p) => sum + p.salary, 0)
        },
        canAffordPlayer(state): (salary: number) => boolean {
            return (salary: number) => state.budget >= salary
        },
        isRosterComplete(state): boolean {
            const roles = ['top', 'jungle', 'mid', 'adc', 'support']
            return roles.every(role => state.roster.some(p => p.role === role))
        },
        getPlayerByRole(state): (role: string) => Player | undefined {
            return (role: string) => state.roster.find(p => p.role === role)
        },
    },

    actions: {
        setTeamName(name: string) {
            this.teamName = name
            this._save()
        },

        selectCoach(coach: Coach) {
            this.coach = coach
            this._save()
        },

        addPlayer(player: Player) {
            const idx = this.roster.findIndex(p => p.role === player.role)
            if (idx >= 0) this.roster.splice(idx, 1, { ...player })
            else this.roster.push({ ...player })
            this._save()
        },

        removePlayer(playerId: string) {
            this.roster = this.roster.filter(p => p.id !== playerId)
            this._save()
        },

        payWeeklySalaries(): boolean {
            if (this.budget < this.totalSalary) return false
            this.budget -= this.totalSalary
            this._save()
            return true
        },

        addBudget(amount: number) {
            this.budget += amount
            this._save()
        },

        updateRosterPlayer(updatedPlayer: Player) {
            const idx = this.roster.findIndex(p => p.id === updatedPlayer.id)
            if (idx >= 0) {
                this.roster.splice(idx, 1, { ...updatedPlayer })
                this._save()
            }
        },

        resetTeam() {
            this.teamName = ''
            this.coach = null
            this.roster = []
            this.budget = 10000
            this._save()
        },

        _save() {
            saveToStorage(SAVE_KEY, {
                teamName: this.teamName,
                coach: this.coach,
                roster: this.roster,
                budget: this.budget,
            })
        },
    },
})
