import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'kirah', name: 'KIRAH', nickname: 'KIRAH', role: 'mid',
    stats: { farm: 5, mechanics: 6, teamfight: 4 },
    champPool: [
        { championId: 'Ahri', knowledge: 85 },
        { championId: 'Fizz', knowledge: 80 },
        { championId: 'Galio', knowledge: 70 },
        { championId: 'Malzahar', knowledge: 65 },
    ],
    popularity: 46, moral: 70, fatigue: 20,
}

export default player
