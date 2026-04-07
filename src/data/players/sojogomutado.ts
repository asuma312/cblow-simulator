import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'sojogomutado', name: 'SOJOGOMUTADO', nickname: 'SOJOGOMUTADO', role: 'support',
    stats: { farm: 1, mechanics: 3, teamfight: 6 },
    champPool: [
        { championId: 'Morgana', knowledge: 80 },
        { championId: 'Nautilus', knowledge: 75 },
        { championId: 'Leona', knowledge: 70 },
        { championId: 'Lux', knowledge: 60 },
    ],
    popularity: 38, moral: 70, fatigue: 20,
}

export default player
