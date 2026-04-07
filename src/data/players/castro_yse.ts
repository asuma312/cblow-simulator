import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'castro_yse', name: 'CASTRO YSE', nickname: 'CASTRO YSE', role: 'mid',
    stats: { farm: 4, mechanics: 5, teamfight: 3 },
    champPool: [
        { championId: 'Yone', knowledge: 75 },
        { championId: 'Aurora', knowledge: 70 },
        { championId: 'Sylas', knowledge: 70 },
        { championId: 'Heimerdinger', knowledge: 60 },
        { championId: 'Vex', knowledge: 55 },
    ],
    popularity: 35, moral: 70, fatigue: 20,
}

export default player
