import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'azir_de_warmog', name: 'AZIR DE WARMOG', nickname: 'AZIR DE WARMOG', role: 'mid',
    stats: { farm: 3, mechanics: 4, teamfight: 2 },
    champPool: [
        { championId: 'Orianna', knowledge: 75 },
        { championId: 'Veigar', knowledge: 70 },
        { championId: 'Malzahar', knowledge: 70 },
        { championId: 'Azir', knowledge: 65 },
        { championId: 'Ryze', knowledge: 55 },
    ],
    popularity: 24, moral: 70, fatigue: 20,
}

export default player
