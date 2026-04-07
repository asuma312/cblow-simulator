import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'rluperini', name: 'RLUPERINI', nickname: 'RLUPERINI', role: 'adc',
    stats: { farm: 6, mechanics: 5, teamfight: 4 },
    champPool: [
        { championId: 'Kai\'Sa', knowledge: 85 },
        { championId: 'Ashe', knowledge: 80 },
        { championId: 'Draven', knowledge: 75 },
        { championId: 'Smolder', knowledge: 70 },
        { championId: 'Sivir', knowledge: 65 },
    ],
    popularity: 52, moral: 70, fatigue: 20,
}

export default player
