import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'robinhogamer17', name: 'ROBINHOGAMER17', nickname: 'ROBINHOGAMER17', role: 'jungle',
    stats: { farm: 3, mechanics: 5, teamfight: 6 },
    champPool: [
        { championId: 'Viego', knowledge: 85 },
        { championId: 'Vi', knowledge: 80 },
        { championId: 'Nocturne', knowledge: 75 },
        { championId: 'Pantheon', knowledge: 70 },
        { championId: 'Volibear', knowledge: 60 },
    ],
    popularity: 50, moral: 70, fatigue: 20,
}

export default player
