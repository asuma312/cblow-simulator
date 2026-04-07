import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'kissidane', name: 'KISSIDANE', nickname: 'KISSIDANE', role: 'top',
    stats: { farm: 2, mechanics: 4, teamfight: 3 },
    champPool: [
        { championId: 'Malphite', knowledge: 70 },
        { championId: 'Garen', knowledge: 65 },
        { championId: 'Yorick', knowledge: 60 },
    ],
    popularity: 20, moral: 70, fatigue: 20,
}

export default player
