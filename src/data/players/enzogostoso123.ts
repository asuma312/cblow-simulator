import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'enzogostoso123', name: 'ENZOGOSTOSO123', nickname: 'ENZOGOSTOSO123', role: 'mid',
    stats: { farm: 6, mechanics: 7, teamfight: 5 },
    champPool: [
        { championId: 'Akali', knowledge: 85 },
        { championId: 'Syndra', knowledge: 80 },
        { championId: 'Ahri', knowledge: 75 },
    ],
    popularity: 55, moral: 70, fatigue: 20,
}

export default player
