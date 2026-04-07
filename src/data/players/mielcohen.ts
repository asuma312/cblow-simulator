import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'mielcohen', name: 'MIELCOHEN', nickname: 'MIELCOHEN', role: 'top',
    stats: { farm: 3, mechanics: 5, teamfight: 4 },
    champPool: [
        { championId: 'Renekton', knowledge: 80 },
        { championId: 'Gangplank', knowledge: 75 },
        { championId: 'Trundle', knowledge: 70 },
        { championId: 'Mordekaiser', knowledge: 65 },
    ],
    popularity: 38, moral: 70, fatigue: 20,
}

export default player
