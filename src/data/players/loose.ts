import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'loose', name: 'LOOSE', nickname: 'LOOSE', role: 'adc',
    stats: { farm: 5, mechanics: 4, teamfight: 3 },
    champPool: [
        { championId: 'Jinx', knowledge: 75 },
        { championId: 'Tristana', knowledge: 70 },
        { championId: 'Miss Fortune', knowledge: 65 },
        { championId: 'Yunara', knowledge: 60 },
    ],
    popularity: 34, moral: 70, fatigue: 20,
}

export default player
