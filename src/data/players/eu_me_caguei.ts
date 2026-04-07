import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'eu_me_caguei', name: 'EU ME CAGUEI', nickname: 'EU ME CAGUEI', role: 'support',
    stats: { farm: 1, mechanics: 3, teamfight: 6 },
    champPool: [
        { championId: 'Karma', knowledge: 75 },
        { championId: 'Rakan', knowledge: 70 },
        { championId: 'Nautilus', knowledge: 65 },
        { championId: 'Leona', knowledge: 60 },
        { championId: 'Tahm Kench', knowledge: 55 },
    ],
    popularity: 30, moral: 70, fatigue: 20,
}

export default player
