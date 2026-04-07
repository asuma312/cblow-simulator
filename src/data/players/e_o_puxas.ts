import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'e_o_puxas', name: 'E O PUXAS', nickname: 'E O PUXAS', role: 'support',
    stats: { farm: 1, mechanics: 2, teamfight: 5 },
    champPool: [
        { championId: 'Braum', knowledge: 80 },
        { championId: 'Tahm Kench', knowledge: 75 },
        { championId: 'Janna', knowledge: 70 },
        { championId: 'Nautilus', knowledge: 65 },
        { championId: 'Galio', knowledge: 60 },
    ],
    popularity: 28, moral: 70, fatigue: 20,
}

export default player
