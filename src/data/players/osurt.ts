import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'osurt', name: 'OSURT', nickname: 'OSURT', role: 'top',
    stats: { farm: 2, mechanics: 4, teamfight: 3 },
    champPool: [
        { championId: 'Jax', knowledge: 75 },
        { championId: 'Sion', knowledge: 70 },
        { championId: 'Malphite', knowledge: 65 },
        { championId: 'Garen', knowledge: 50 },
    ],
    popularity: 28, moral: 70, fatigue: 20,
}

export default player
