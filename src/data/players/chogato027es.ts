import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'chogato027es', name: 'CHOGATO027ES', nickname: 'CHOGATO027ES', role: 'top',
    stats: { farm: 4, mechanics: 6, teamfight: 5 },
    champPool: [
        { championId: 'Sion', knowledge: 85 },
        { championId: 'Illaoi', knowledge: 80 },
        { championId: 'Urgot', knowledge: 75 },
        { championId: 'Jax', knowledge: 70 },
        { championId: 'Mordekaiser', knowledge: 60 },
    ],
    popularity: 52, moral: 70, fatigue: 20,
}

export default player
