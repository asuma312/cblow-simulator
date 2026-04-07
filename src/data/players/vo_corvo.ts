import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'vo_corvo', name: 'VÔ CORVO', nickname: 'VÔ CORVO', role: 'jungle',
    stats: { farm: 2, mechanics: 4, teamfight: 5 },
    champPool: [
        { championId: 'Jax', knowledge: 75 },
        { championId: 'Trundle', knowledge: 70 },
        { championId: 'Mordekaiser', knowledge: 65 },
        { championId: 'Amumu', knowledge: 60 },
        { championId: 'Malphite', knowledge: 55 },
    ],
    popularity: 35, moral: 70, fatigue: 20,
}

export default player
