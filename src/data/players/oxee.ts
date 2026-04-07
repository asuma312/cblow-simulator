import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'oxee', name: 'OXEE', nickname: 'OXEE', role: 'support',
    stats: { farm: 1, mechanics: 3, teamfight: 6 },
    champPool: [
        { championId: 'Thresh', knowledge: 85 },
        { championId: 'Morgana', knowledge: 75 },
        { championId: 'Braum', knowledge: 70 },
        { championId: 'Nautilus', knowledge: 65 },
        { championId: 'Karma', knowledge: 60 },
    ],
    popularity: 42, moral: 70, fatigue: 20,
}

export default player
