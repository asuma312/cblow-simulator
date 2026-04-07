import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'pdj_shaco_facao', name: 'PDJ SHACO FACAO', nickname: 'PDJ SHACO FACAO', role: 'jungle',
    stats: { farm: 2, mechanics: 4, teamfight: 5 },
    champPool: [
        { championId: 'Kayn', knowledge: 80 },
        { championId: 'Nocturne', knowledge: 75 },
        { championId: 'Shaco', knowledge: 70 },
        { championId: 'Master Yi', knowledge: 65 },
        { championId: 'Nidalee', knowledge: 60 },
    ],
    popularity: 40, moral: 70, fatigue: 20,
}

export default player
