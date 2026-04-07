import type { Player } from '@/types/game.types'

const player: Player = {
    id: 'veio_do_whatsapp', name: 'VEIO DO WHATSAPP', nickname: 'VEIO DO WHATSAPP', role: 'jungle',
    stats: { farm: 1, mechanics: 3, teamfight: 4 },
    champPool: [
        { championId: 'Trundle', knowledge: 65 },
        { championId: 'Udyr', knowledge: 60 },
    ],
    popularity: 15, moral: 70, fatigue: 20,
}

export default player
