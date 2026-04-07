import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'sofadinha', name: 'SÓFADINHA', nickname: 'SÓFADINHA', role: 'support',
    stats: { farm: 2, mechanics: 4, teamfight: 7 },
    champPool: [
        { championId: 'Leona', knowledge: 85 },
        { championId: 'Nami', knowledge: 80 },
        { championId: 'Seraphine', knowledge: 65 },
    ],
    popularity: 44, moral: 70, fatigue: 20,
}

export default player
