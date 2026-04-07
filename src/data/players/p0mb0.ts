import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'p0mb0', name: 'P0MB0', nickname: 'P0MB0', role: 'support',
    stats: { farm: 1, mechanics: 2, teamfight: 5 },
    champPool: [
        { championId: 'Taric', knowledge: 75 },
        { championId: 'Rakan', knowledge: 65 },
        { championId: 'Leona', knowledge: 60 },
        { championId: 'Swain', knowledge: 50 },
    ],
    popularity: 20, moral: 70, fatigue: 20,
}

export default player
