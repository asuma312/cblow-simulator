import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'bshadow7', name: 'BSHADOW7', nickname: 'BSHADOW7', role: 'jungle',
    stats: { farm: 5, mechanics: 7, teamfight: 8 },
    champPool: [
        { championId: 'Kayn', knowledge: 90 },
        { championId: 'Viego', knowledge: 85 },
        { championId: 'Amumu', knowledge: 75 },
        { championId: 'Jax', knowledge: 70 },
    ],
    popularity: 65, moral: 70, fatigue: 20,
}

export default player
