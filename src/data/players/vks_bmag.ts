import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'vks_bmag', name: 'VKS BMAG', nickname: 'VKS BMAG', role: 'jungle',
    stats: { farm: 1, mechanics: 3, teamfight: 4 },
    champPool: [
        { championId: 'Malphite', knowledge: 70 },
        { championId: 'Wukong', knowledge: 65 },
        { championId: 'Fiddlesticks', knowledge: 60 },
        { championId: 'Cho\'Gath', knowledge: 55 },
    ],
    popularity: 28, moral: 70, fatigue: 20,
}

export default player
