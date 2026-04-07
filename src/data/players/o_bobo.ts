import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'o_bobo', name: 'O BOBO', nickname: 'O BOBO', role: 'mid',
    stats: { farm: 6, mechanics: 7, teamfight: 5 },
    champPool: [
        { championId: 'Ahri', knowledge: 85 },
        { championId: 'Veigar', knowledge: 82 },
        { championId: 'Aurora', knowledge: 75 },
        { championId: 'Malzahar', knowledge: 65 },
    ],
    popularity: 62, moral: 70, fatigue: 20,
}

export default player
