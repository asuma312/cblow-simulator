import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'lippeh', name: 'LIPPEH', nickname: 'LIPPEH', role: 'adc',
    stats: { farm: 6, mechanics: 5, teamfight: 4 },
    champPool: [
        { championId: 'Ezreal', knowledge: 85 },
        { championId: 'Smolder', knowledge: 80 },
        { championId: 'Caitlyn', knowledge: 75 },
        { championId: 'Twitch', knowledge: 70 },
        { championId: 'Aphelios', knowledge: 65 },
    ],
    popularity: 48, moral: 70, fatigue: 20,
}

export default player
