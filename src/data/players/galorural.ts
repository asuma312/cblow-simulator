import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'galorural', name: 'GALORURAL', nickname: 'GALORURAL', role: 'jungle',
    stats: { farm: 3, mechanics: 5, teamfight: 6 },
    champPool: [
        { championId: 'Evelynn', knowledge: 85 },
        { championId: 'Wukong', knowledge: 80 },
        { championId: 'Pantheon', knowledge: 75 },
        { championId: 'Shyvana', knowledge: 70 },
        { championId: 'Hecarim', knowledge: 65 },
    ],
    popularity: 48, moral: 70, fatigue: 20,
}

export default player
