import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'zangrando', name: 'ZANGRANDO', nickname: 'ZANGRANDO', role: 'jungle',
    stats: { farm: 2, mechanics: 4, teamfight: 5 },
    champPool: [
        { championId: 'Xin Zhao', knowledge: 75 },
        { championId: 'Jarvan IV', knowledge: 70 },
        { championId: 'Sejuani', knowledge: 70 },
        { championId: 'Trundle', knowledge: 65 },
    ],
    popularity: 32, moral: 70, fatigue: 20,
}

export default player
