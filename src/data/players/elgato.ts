import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'elgato', name: 'ELGATO', nickname: 'ELGATO', role: 'adc',
    stats: { farm: 5, mechanics: 4, teamfight: 3 },
    champPool: [
        { championId: 'Tristana', knowledge: 80 },
        { championId: 'Jinx', knowledge: 75 },
        { championId: 'Smolder', knowledge: 65 },
        { championId: 'Caitlyn', knowledge: 60 },
        { championId: 'Nilah', knowledge: 55 },
    ],
    popularity: 34, moral: 70, fatigue: 20,
}

export default player
