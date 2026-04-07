import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'bpm_zecapagod', name: 'BPM ZECAPAGOD', nickname: 'BPM ZECAPAGOD', role: 'top',
    stats: { farm: 4, mechanics: 6, teamfight: 5 },
    champPool: [
        { championId: 'Sett', knowledge: 85 },
        { championId: 'Illaoi', knowledge: 80 },
        { championId: 'Mordekaiser', knowledge: 70 },
        { championId: 'Volibear', knowledge: 65 },
        { championId: 'Tahm Kench', knowledge: 60 },
    ],
    popularity: 50, moral: 70, fatigue: 20,
}

export default player
