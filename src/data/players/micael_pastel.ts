import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'micael_pastel', name: 'MICAEL PASTEL', nickname: 'MICAEL PASTEL', role: 'support',
    stats: { farm: 3, mechanics: 5, teamfight: 8 },
    champPool: [
        { championId: 'Braum', knowledge: 85 },
        { championId: 'Karma', knowledge: 80 },
        { championId: 'Milio', knowledge: 75 },
        { championId: 'Lux', knowledge: 70 },
    ],
    popularity: 65, moral: 70, fatigue: 20,
}

export default player
