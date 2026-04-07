import { defineStore } from 'pinia'
import type { Champions, DraftStep, SessionData, SingleChampion } from '@/types/championSelect.types'
import { CHAMPION_POSITIONS } from '@/data/champions'

const DRAFT_ORDER: DraftStep[] = [
    { phase: 'ban', side: 'blue' },
    { phase: 'ban', side: 'red' },
    { phase: 'ban', side: 'blue' },
    { phase: 'ban', side: 'red' },
    { phase: 'ban', side: 'blue' },
    { phase: 'ban', side: 'red' },
    { phase: 'pick', side: 'blue' },
    { phase: 'pick', side: 'red' },
    { phase: 'pick', side: 'red' },
    { phase: 'pick', side: 'blue' },
    { phase: 'pick', side: 'blue' },
    { phase: 'pick', side: 'red' },
    { phase: 'ban', side: 'red' },
    { phase: 'ban', side: 'blue' },
    { phase: 'ban', side: 'red' },
    { phase: 'ban', side: 'blue' },
    { phase: 'pick', side: 'red' },
    { phase: 'pick', side: 'blue' },
    { phase: 'pick', side: 'blue' },
    { phase: 'pick', side: 'red' },
]

export const useChampionsStore = defineStore('champions', {
    state: () => ({
        queryFilter: '',
        roleFilter: 'all',
        champions: [] as SingleChampion[],
        bans: {
            red: [] as Champions,
            blue: [] as Champions,
        },
        picks: {
            red: [] as Champions,
            blue: [] as Champions,
        },
        draftStep: 0,
        playerSide: 'blue' as 'blue' | 'red',
    }),

    getters: {
        filteredChampions(): SingleChampion[] {
            let list = this.champions
            if (this.roleFilter !== 'all') {
                const role = this.roleFilter.charAt(0).toUpperCase() + this.roleFilter.slice(1)
                list = list.filter(c => (CHAMPION_POSITIONS[c.name] ?? []).some(p => p.toLowerCase() === role.toLowerCase()))
            }
            if (this.queryFilter) {
                list = list.filter(c => c.name.toLowerCase().includes(this.queryFilter.toLowerCase()))
            }
            return list
        },

        sessionData(): SessionData {
            return {
                bans: {
                    blue: this.bans.blue.map(c => c.name),
                    red: this.bans.red.map(c => c.name),
                },
                picks: {
                    blue: this.picks.blue.map(c => c.name),
                    red: this.picks.red.map(c => c.name),
                },
            }
        },

        bannedChampions(): string[] {
            return [...this.sessionData.bans.red, ...this.sessionData.bans.blue]
        },

        pickedChampions(): string[] {
            return [...this.sessionData.picks.red, ...this.sessionData.picks.blue]
        },

        unavailableChampions(): string[] {
            return [...this.bannedChampions, ...this.pickedChampions]
        },

        currentTurn(): DraftStep | null {
            return DRAFT_ORDER[this.draftStep] ?? null
        },

        isDraftComplete(): boolean {
            return this.draftStep >= DRAFT_ORDER.length
        },

        isPlayerTurn(): boolean {
            const turn = DRAFT_ORDER[this.draftStep]
            if (!turn) return false
            return turn.side === this.playerSide
        },
    },

    actions: {
        async getChampionList() {
            try {
                const res = await fetch('https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/champion.json')
                const response = await res.json()
                const championsData = Object.values(response.data) as SingleChampion[]
                this.champions = championsData.map((val: SingleChampion) => ({
                    name: val.name,
                    id: val.id,
                    tags: val.tags ?? [],
                })) as SingleChampion[]
            } catch (err) {
                console.error('Failed to fetch champion list:', err)
            }
        },

        setFilter(filter: string) {
            this.queryFilter = filter
        },

        setRoleFilter(role: string) {
            this.roleFilter = role
        },

        setPlayerSide(side: 'blue' | 'red') {
            this.playerSide = side
        },

        confirmChampion(champ: string) {
            const step = DRAFT_ORDER[this.draftStep]
            if (!step) return
            const portrait = { name: champ, image: `/champions/${champ}.png` }
            if (step.phase === 'ban') {
                this.bans[step.side].push(portrait)
            } else {
                this.picks[step.side].push(portrait)
            }
            this.draftStep++
        },

        resetDraft() {
            this.bans = { red: [], blue: [] }
            this.picks = { red: [], blue: [] }
            this.draftStep = 0
            this.queryFilter = ''
            this.roleFilter = 'all'
        },
    },
})
