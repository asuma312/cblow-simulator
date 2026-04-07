import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'jeiel_up', name: 'JEIEL UP', nickname: 'JEIEL UP', role: 'top',
    stats: { farm: 3, mechanics: 5, teamfight: 4 },
    champPool: [
        { championId: 'Urgot', knowledge: 80 },
        { championId: 'Illaoi', knowledge: 75 },
        { championId: 'Renekton', knowledge: 65 },
        { championId: 'Gwen', knowledge: 60 },
        { championId: 'Sion', knowledge: 55 },
    ],
    popularity: 35, moral: 70, fatigue: 20,
}

export default player
