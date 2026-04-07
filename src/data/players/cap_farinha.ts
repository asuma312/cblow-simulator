import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'cap_farinha', name: 'CAP FARINHA', nickname: 'CAP FARINHA', role: 'top',
    stats: { farm: 5, mechanics: 7, teamfight: 6 },
    champPool: [
        { championId: 'Urgot', knowledge: 85 },
        { championId: 'Sett', knowledge: 80 },
        { championId: 'Volibear', knowledge: 70 },
        { championId: 'Renekton', knowledge: 65 },
    ],
    popularity: 55, moral: 70, fatigue: 20,
}

export default player
