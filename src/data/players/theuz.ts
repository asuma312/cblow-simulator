import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'theuz', name: 'THEUZ', nickname: 'THEUZ', role: 'support',
    stats: { farm: 5, mechanics: 8, teamfight: 10 },
    champPool: [
        { championId: 'Morgana', knowledge: 92 },
        { championId: 'Rakan', knowledge: 88 },
        { championId: 'Yuumi', knowledge: 80 },
        { championId: 'Nautilus', knowledge: 75 },
        { championId: 'Janna', knowledge: 70 },
    ],
    popularity: 88, moral: 70, fatigue: 20,
}

export default player
