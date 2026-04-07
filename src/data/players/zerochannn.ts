import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'zerochannn', name: 'ZEROCHANNN', nickname: 'ZEROCHANNN', role: 'jungle',
    stats: { farm: 4, mechanics: 6, teamfight: 7 },
    champPool: [
        { championId: 'Shyvana', knowledge: 85 },
        { championId: 'Wukong', knowledge: 80 },
        { championId: 'Jarvan IV', knowledge: 75 },
        { championId: 'Xin Zhao', knowledge: 70 },
        { championId: 'Nocturne', knowledge: 65 },
    ],
    popularity: 58, moral: 70, fatigue: 20,
}

export default player
