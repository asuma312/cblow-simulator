import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'chenderboy', name: 'CHENDERBOY', nickname: 'CHENDERBOY', role: 'top',
    stats: { farm: 2, mechanics: 4, teamfight: 3 },
    champPool: [
        { championId: 'K\'Sante', knowledge: 75 },
        { championId: 'Olaf', knowledge: 65 },
        { championId: 'Renekton', knowledge: 60 },
        { championId: 'Dr. Mundo', knowledge: 55 },
        { championId: 'Sion', knowledge: 50 },
    ],
    popularity: 22, moral: 70, fatigue: 20,
}

export default player
