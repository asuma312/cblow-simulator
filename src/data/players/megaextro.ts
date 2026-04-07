import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'megaextro', name: 'MEGAEXTRO', nickname: 'MEGAEXTRO', role: 'adc',
    stats: { farm: 5, mechanics: 4, teamfight: 3 },
    champPool: [
        { championId: 'Nilah', knowledge: 80 },
        { championId: 'Miss Fortune', knowledge: 75 },
        { championId: 'Kai\'Sa', knowledge: 70 },
        { championId: 'Smolder', knowledge: 65 },
        { championId: 'Jinx', knowledge: 60 },
    ],
    popularity: 34, moral: 70, fatigue: 20,
}

export default player
