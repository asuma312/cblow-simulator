import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'thaaylady', name: 'THAAYLADY', nickname: 'THAAYLADY', role: 'adc',
    stats: { farm: 5, mechanics: 4, teamfight: 3 },
    champPool: [
        { championId: 'Miss Fortune', knowledge: 80 },
        { championId: 'Tristana', knowledge: 75 },
        { championId: 'Varus', knowledge: 70 },
        { championId: 'Ashe', knowledge: 65 },
    ],
    popularity: 38, moral: 70, fatigue: 20,
}

export default player
