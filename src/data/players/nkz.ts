import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'nkz', name: 'NKZ', nickname: 'NKZ', role: 'adc',
    stats: { farm: 8, mechanics: 7, teamfight: 6 },
    champPool: [
        { championId: 'Caitlyn', knowledge: 90 },
        { championId: 'Draven', knowledge: 85 },
        { championId: 'Jinx', knowledge: 80 },
        { championId: 'Smolder', knowledge: 75 },
        { championId: 'Varus', knowledge: 65 },
    ],
    popularity: 70, moral: 70, fatigue: 20,
}

export default player
