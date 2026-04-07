import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'frenezeri', name: 'FRENEZERI', nickname: 'FRENEZERI', role: 'mid',
    stats: { farm: 4, mechanics: 5, teamfight: 3 },
    champPool: [
        { championId: 'Ahri', knowledge: 80 },
        { championId: 'Galio', knowledge: 75 },
        { championId: 'Heimerdinger', knowledge: 70 },
        { championId: 'Azir', knowledge: 65 },
        { championId: 'Malzahar', knowledge: 60 },
    ],
    popularity: 30, moral: 70, fatigue: 20,
}

export default player
