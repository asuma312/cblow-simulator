import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'ruim_e_esquisito', name: 'RUIM E ESQUISITO', nickname: 'RUIM E ESQUISITO', role: 'mid',
    stats: { farm: 5, mechanics: 6, teamfight: 4 },
    champPool: [
        { championId: 'Heimerdinger', knowledge: 85 },
        { championId: 'Veigar', knowledge: 82 },
        { championId: 'Annie', knowledge: 75 },
        { championId: 'Malzahar', knowledge: 65 },
    ],
    popularity: 52, moral: 70, fatigue: 20,
}

export default player
