import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'criz', name: 'CRIZ', nickname: 'CRIZ', role: 'adc',
    stats: { farm: 5, mechanics: 4, teamfight: 3 },
    champPool: [
        { championId: 'Jinx', knowledge: 80 },
        { championId: 'Yunara', knowledge: 75 },
        { championId: 'Tristana', knowledge: 70 },
        { championId: 'Draven', knowledge: 65 },
        { championId: 'Ashe', knowledge: 55 },
    ],
    popularity: 40, moral: 70, fatigue: 20,
}

export default player
