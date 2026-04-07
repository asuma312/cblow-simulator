import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'danverii', name: 'DANVERII', nickname: 'DANVERII', role: 'mid',
    stats: { farm: 4, mechanics: 5, teamfight: 3 },
    champPool: [
        { championId: 'Malzahar', knowledge: 75 },
        { championId: 'Akali', knowledge: 70 },
        { championId: 'Naafiri', knowledge: 65 },
        { championId: 'Lux', knowledge: 55 },
    ],
    popularity: 38, moral: 70, fatigue: 20,
}

export default player
