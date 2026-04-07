import type { Player } from '@/types/game.types'

export const ALL_PLAYERS: Player[] = [
    // ── TOPs ─────────────────────────────────────────────────────────────────

    {
        id: 'jeiel_up', name: 'JEIEL UP', nickname: 'JEIEL UP', role: 'top',
        stats: { farm: 3, mechanics: 5, teamfight: 4 },
        champPool: [
            { championId: 'Urgot', knowledge: 80 },
            { championId: 'Illaoi', knowledge: 75 },
            { championId: 'Renekton', knowledge: 65 },
            { championId: 'Gwen', knowledge: 60 },
            { championId: 'Sion', knowledge: 55 },
        ],
        popularity: 35, moral: 70, fatigue: 20,
    },
    {
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
    },
    {
        id: 'chogato027es', name: 'CHOGATO027ES', nickname: 'CHOGATO027ES', role: 'top',
        stats: { farm: 4, mechanics: 6, teamfight: 5 },
        champPool: [
            { championId: 'Sion', knowledge: 85 },
            { championId: 'Illaoi', knowledge: 80 },
            { championId: 'Urgot', knowledge: 75 },
            { championId: 'Jax', knowledge: 70 },
            { championId: 'Mordekaiser', knowledge: 60 },
        ],
        popularity: 52, moral: 70, fatigue: 20,
    },
    {
        id: 'cap_farinha', name: 'CAP FARINHA', nickname: 'CAP FARINHA', role: 'top',
        stats: { farm: 5, mechanics: 7, teamfight: 6 },
        champPool: [
            { championId: 'Urgot', knowledge: 85 },
            { championId: 'Sett', knowledge: 80 },
            { championId: 'Volibear', knowledge: 70 },
            { championId: 'Renekton', knowledge: 65 },
        ],
        popularity: 55, moral: 70, fatigue: 20,
    },
    {
        id: 'mielcohen', name: 'MIELCOHEN', nickname: 'MIELCOHEN', role: 'top',
        stats: { farm: 3, mechanics: 5, teamfight: 4 },
        champPool: [
            { championId: 'Renekton', knowledge: 80 },
            { championId: 'Gangplank', knowledge: 75 },
            { championId: 'Trundle', knowledge: 70 },
            { championId: 'Mordekaiser', knowledge: 65 },
        ],
        popularity: 38, moral: 70, fatigue: 20,
    },
    {
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
    },
    {
        id: 'kissidane', name: 'KISSIDANE', nickname: 'KISSIDANE', role: 'top',
        stats: { farm: 2, mechanics: 4, teamfight: 3 },
        champPool: [
            { championId: 'Malphite', knowledge: 70 },
            { championId: 'Garen', knowledge: 65 },
            { championId: 'Yorick', knowledge: 60 },
        ],
        popularity: 20, moral: 70, fatigue: 20,
    },
    {
        id: 'osurt', name: 'OSURT', nickname: 'OSURT', role: 'top',
        stats: { farm: 2, mechanics: 4, teamfight: 3 },
        champPool: [
            { championId: 'Jax', knowledge: 75 },
            { championId: 'Sion', knowledge: 70 },
            { championId: 'Malphite', knowledge: 65 },
            { championId: 'Garen', knowledge: 50 },
        ],
        popularity: 28, moral: 70, fatigue: 20,
    },

    // ── JUNGLEs ──────────────────────────────────────────────────────────────

    {
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
    },
    {
        id: 'bshadow7', name: 'BSHADOW7', nickname: 'BSHADOW7', role: 'jungle',
        stats: { farm: 5, mechanics: 7, teamfight: 8 },
        champPool: [
            { championId: 'Kayn', knowledge: 90 },
            { championId: 'Viego', knowledge: 85 },
            { championId: 'Amumu', knowledge: 75 },
            { championId: 'Jax', knowledge: 70 },
        ],
        popularity: 65, moral: 70, fatigue: 20,
    },
    {
        id: 'vo_corvo', name: 'VÔ CORVO', nickname: 'VÔ CORVO', role: 'jungle',
        stats: { farm: 2, mechanics: 4, teamfight: 5 },
        champPool: [
            { championId: 'Jax', knowledge: 75 },
            { championId: 'Trundle', knowledge: 70 },
            { championId: 'Mordekaiser', knowledge: 65 },
            { championId: 'Amumu', knowledge: 60 },
            { championId: 'Malphite', knowledge: 55 },
        ],
        popularity: 35, moral: 70, fatigue: 20,
    },
    {
        id: 'zerochannn', name: 'ZEROCHANNN', nickname: 'ZEROCHANNN', role: 'jungle',
        stats: { farm: 4, mechanics: 6, teamfight: 7 },
        champPool: [
            { championId: 'Shyvana', knowledge: 85 },
            { championId: 'Wukong', knowledge: 80 },
            { championId: 'Jarvan IV', knowledge: 75 },
            { championId: 'Xin Zhao', knowledge: 70 },
            { championId: 'Nocturne', knowledge: 65 },
        ],
        popularity: 58, moral: 70, fatigue: 20,
    },
    {
        id: 'zangrando', name: 'ZANGRANDO', nickname: 'ZANGRANDO', role: 'jungle',
        stats: { farm: 2, mechanics: 4, teamfight: 5 },
        champPool: [
            { championId: 'Xin Zhao', knowledge: 75 },
            { championId: 'Jarvan IV', knowledge: 70 },
            { championId: 'Sejuani', knowledge: 70 },
            { championId: 'Trundle', knowledge: 65 },
        ],
        popularity: 32, moral: 70, fatigue: 20,
    },
    {
        id: 'vks_bmag', name: 'VKS BMAG', nickname: 'VKS BMAG', role: 'jungle',
        stats: { farm: 1, mechanics: 3, teamfight: 4 },
        champPool: [
            { championId: 'Malphite', knowledge: 70 },
            { championId: 'Wukong', knowledge: 65 },
            { championId: 'Fiddlesticks', knowledge: 60 },
            { championId: 'Cho\'Gath', knowledge: 55 },
        ],
        popularity: 28, moral: 70, fatigue: 20,
    },
    {
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
    },
    {
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
    },
    {
        id: 'veio_do_whatsapp', name: 'VEIO DO WHATSAPP', nickname: 'VEIO DO WHATSAPP', role: 'jungle',
        stats: { farm: 1, mechanics: 3, teamfight: 4 },
        champPool: [
            { championId: 'Trundle', knowledge: 65 },
            { championId: 'Udyr', knowledge: 60 },
        ],
        popularity: 15, moral: 70, fatigue: 20,
    },

    // ── MIDs ─────────────────────────────────────────────────────────────────

    {
        id: 'castro_yse', name: 'CASTRO YSE', nickname: 'CASTRO YSE', role: 'mid',
        stats: { farm: 4, mechanics: 5, teamfight: 3 },
        champPool: [
            { championId: 'Yone', knowledge: 75 },
            { championId: 'Aurora', knowledge: 70 },
            { championId: 'Sylas', knowledge: 70 },
            { championId: 'Heimerdinger', knowledge: 60 },
            { championId: 'Vex', knowledge: 55 },
        ],
        popularity: 35, moral: 70, fatigue: 20,
    },
    {
        id: 'enzogostoso123', name: 'ENZOGOSTOSO123', nickname: 'ENZOGOSTOSO123', role: 'mid',
        stats: { farm: 6, mechanics: 7, teamfight: 5 },
        champPool: [
            { championId: 'Akali', knowledge: 85 },
            { championId: 'Syndra', knowledge: 80 },
            { championId: 'Ahri', knowledge: 75 },
        ],
        popularity: 55, moral: 70, fatigue: 20,
    },
    {
        id: 'ruim_e_esquisito', name: 'RUIM E ESQUISITO', nickname: 'RUIM E ESQUISITO', role: 'mid',
        stats: { farm: 5, mechanics: 6, teamfight: 4 },
        champPool: [
            { championId: 'Heimerdinger', knowledge: 85 },
            { championId: 'Veigar', knowledge: 82 },
            { championId: 'Annie', knowledge: 75 },
            { championId: 'Malzahar', knowledge: 65 },
        ],
        popularity: 52, moral: 70, fatigue: 20,
    },
    {
        id: 'kirah', name: 'KIRAH', nickname: 'KIRAH', role: 'mid',
        stats: { farm: 5, mechanics: 6, teamfight: 4 },
        champPool: [
            { championId: 'Ahri', knowledge: 85 },
            { championId: 'Fizz', knowledge: 80 },
            { championId: 'Galio', knowledge: 70 },
            { championId: 'Malzahar', knowledge: 65 },
        ],
        popularity: 46, moral: 70, fatigue: 20,
    },
    {
        id: 'o_bobo', name: 'O BOBO', nickname: 'O BOBO', role: 'mid',
        stats: { farm: 6, mechanics: 7, teamfight: 5 },
        champPool: [
            { championId: 'Ahri', knowledge: 85 },
            { championId: 'Veigar', knowledge: 82 },
            { championId: 'Aurora', knowledge: 75 },
            { championId: 'Malzahar', knowledge: 65 },
        ],
        popularity: 62, moral: 70, fatigue: 20,
    },
    {
        id: 'danverii', name: 'DANVERII', nickname: 'DANVERII', role: 'mid',
        stats: { farm: 4, mechanics: 5, teamfight: 3 },
        champPool: [
            { championId: 'Malzahar', knowledge: 75 },
            { championId: 'Akali', knowledge: 70 },
            { championId: 'Naafiri', knowledge: 65 },
            { championId: 'Lux', knowledge: 55 },
        ],
        popularity: 38, moral: 70, fatigue: 20,
    },
    {
        id: 'frenezeri', name: 'FRENEZERI', nickname: 'FRENEZERI', role: 'mid',
        stats: { farm: 4, mechanics: 5, teamfight: 3 },
        champPool: [
            { championId: 'Ahri', knowledge: 80 },
            { championId: 'Galio', knowledge: 75 },
            { championId: 'Heimerdinger', knowledge: 70 },
            { championId: 'Azir', knowledge: 65 },
            { championId: 'Malzahar', knowledge: 60 },
        ],
        popularity: 30, moral: 70, fatigue: 20,
    },
    {
        id: 'azir_de_warmog', name: 'AZIR DE WARMOG', nickname: 'AZIR DE WARMOG', role: 'mid',
        stats: { farm: 3, mechanics: 4, teamfight: 2 },
        champPool: [
            { championId: 'Orianna', knowledge: 75 },
            { championId: 'Veigar', knowledge: 70 },
            { championId: 'Malzahar', knowledge: 70 },
            { championId: 'Azir', knowledge: 65 },
            { championId: 'Ryze', knowledge: 55 },
        ],
        popularity: 24, moral: 70, fatigue: 20,
    },

    // ── ADCs ─────────────────────────────────────────────────────────────────

    {
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
    },
    {
        id: 'nkz', name: 'NKZ', nickname: 'NKZ', role: 'adc',
        stats: { farm: 8, mechanics: 7, teamfight: 6 },
        champPool: [
            { championId: 'Caitlyn', knowledge: 90 },
            { championId: 'Draven', knowledge: 85 },
            { championId: 'Jinx', knowledge: 80 },
            { championId: 'Smolder', knowledge: 75 },
            { championId: 'Varus', knowledge: 65 },
        ],
        popularity: 70, moral: 70, fatigue: 20,
    },
    {
        id: 'elgato', name: 'ELGATO', nickname: 'ELGATO', role: 'adc',
        stats: { farm: 5, mechanics: 4, teamfight: 3 },
        champPool: [
            { championId: 'Tristana', knowledge: 80 },
            { championId: 'Jinx', knowledge: 75 },
            { championId: 'Smolder', knowledge: 65 },
            { championId: 'Caitlyn', knowledge: 60 },
            { championId: 'Nilah', knowledge: 55 },
        ],
        popularity: 34, moral: 70, fatigue: 20,
    },
    {
        id: 'rluperini', name: 'RLUPERINI', nickname: 'RLUPERINI', role: 'adc',
        stats: { farm: 6, mechanics: 5, teamfight: 4 },
        champPool: [
            { championId: 'Kai\'Sa', knowledge: 85 },
            { championId: 'Ashe', knowledge: 80 },
            { championId: 'Draven', knowledge: 75 },
            { championId: 'Smolder', knowledge: 70 },
            { championId: 'Sivir', knowledge: 65 },
        ],
        popularity: 52, moral: 70, fatigue: 20,
    },
    {
        id: 'thaaylady', name: 'THAAYLADY', nickname: 'THAAYLADY', role: 'adc',
        stats: { farm: 5, mechanics: 4, teamfight: 3 },
        champPool: [
            { championId: 'Miss Fortune', knowledge: 80 },
            { championId: 'Tristana', knowledge: 75 },
            { championId: 'Varus', knowledge: 70 },
            { championId: 'Ashe', knowledge: 65 },
        ],
        popularity: 38, moral: 70, fatigue: 20,
    },
    {
        id: 'loose', name: 'LOOSE', nickname: 'LOOSE', role: 'adc',
        stats: { farm: 5, mechanics: 4, teamfight: 3 },
        champPool: [
            { championId: 'Jinx', knowledge: 75 },
            { championId: 'Tristana', knowledge: 70 },
            { championId: 'Miss Fortune', knowledge: 65 },
            { championId: 'Yunara', knowledge: 60 },
        ],
        popularity: 34, moral: 70, fatigue: 20,
    },
    {
        id: 'megaextro', name: 'MEGAEXTRO', nickname: 'MEGAEXTRO', role: 'adc',
        stats: { farm: 5, mechanics: 4, teamfight: 3 },
        champPool: [
            { championId: 'Nilah', knowledge: 80 },
            { championId: 'Miss Fortune', knowledge: 75 },
            { championId: 'Kai\'Sa', knowledge: 70 },
            { championId: 'Smolder', knowledge: 65 },
            { championId: 'Jinx', knowledge: 60 },
        ],
        popularity: 34, moral: 70, fatigue: 20,
    },
    {
        id: 'criz', name: 'CRIZ', nickname: 'CRIZ', role: 'adc',
        stats: { farm: 5, mechanics: 4, teamfight: 3 },
        champPool: [
            { championId: 'Jinx', knowledge: 80 },
            { championId: 'Yunara', knowledge: 75 },
            { championId: 'Tristana', knowledge: 70 },
            { championId: 'Draven', knowledge: 65 },
            { championId: 'Ashe', knowledge: 55 },
        ],
        popularity: 40, moral: 70, fatigue: 20,
    },

    // ── SUPPORTs ─────────────────────────────────────────────────────────────

    {
        id: 'e_o_puxas', name: 'E O PUXAS', nickname: 'E O PUXAS', role: 'support',
        stats: { farm: 1, mechanics: 2, teamfight: 5 },
        champPool: [
            { championId: 'Braum', knowledge: 80 },
            { championId: 'Tahm Kench', knowledge: 75 },
            { championId: 'Janna', knowledge: 70 },
            { championId: 'Nautilus', knowledge: 65 },
            { championId: 'Galio', knowledge: 60 },
        ],
        popularity: 28, moral: 70, fatigue: 20,
    },
    {
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
    },
    {
        id: 'oxee', name: 'OXEE', nickname: 'OXEE', role: 'support',
        stats: { farm: 1, mechanics: 3, teamfight: 6 },
        champPool: [
            { championId: 'Thresh', knowledge: 85 },
            { championId: 'Morgana', knowledge: 75 },
            { championId: 'Braum', knowledge: 70 },
            { championId: 'Nautilus', knowledge: 65 },
            { championId: 'Karma', knowledge: 60 },
        ],
        popularity: 42, moral: 70, fatigue: 20,
    },
    {
        id: 'sofadinha', name: 'SÓFADINHA', nickname: 'SÓFADINHA', role: 'support',
        stats: { farm: 2, mechanics: 4, teamfight: 7 },
        champPool: [
            { championId: 'Leona', knowledge: 85 },
            { championId: 'Nami', knowledge: 80 },
            { championId: 'Seraphine', knowledge: 65 },
        ],
        popularity: 44, moral: 70, fatigue: 20,
    },
    {
        id: 'sojogomutado', name: 'SOJOGOMUTADO', nickname: 'SOJOGOMUTADO', role: 'support',
        stats: { farm: 1, mechanics: 3, teamfight: 6 },
        champPool: [
            { championId: 'Morgana', knowledge: 80 },
            { championId: 'Nautilus', knowledge: 75 },
            { championId: 'Leona', knowledge: 70 },
            { championId: 'Lux', knowledge: 60 },
        ],
        popularity: 38, moral: 70, fatigue: 20,
    },
    {
        id: 'eu_me_caguei', name: 'EU ME CAGUEI', nickname: 'EU ME CAGUEI', role: 'support',
        stats: { farm: 1, mechanics: 3, teamfight: 6 },
        champPool: [
            { championId: 'Karma', knowledge: 75 },
            { championId: 'Rakan', knowledge: 70 },
            { championId: 'Nautilus', knowledge: 65 },
            { championId: 'Leona', knowledge: 60 },
            { championId: 'Tahm Kench', knowledge: 55 },
        ],
        popularity: 30, moral: 70, fatigue: 20,
    },
    {
        id: 'p0mb0', name: 'P0MB0', nickname: 'P0MB0', role: 'support',
        stats: { farm: 1, mechanics: 2, teamfight: 5 },
        champPool: [
            { championId: 'Taric', knowledge: 75 },
            { championId: 'Rakan', knowledge: 65 },
            { championId: 'Leona', knowledge: 60 },
            { championId: 'Swain', knowledge: 50 },
        ],
        popularity: 20, moral: 70, fatigue: 20,
    },
    {
        id: 'micael_pastel', name: 'MICAEL PASTEL', nickname: 'MICAEL PASTEL', role: 'support',
        stats: { farm: 3, mechanics: 5, teamfight: 8 },
        champPool: [
            { championId: 'Braum', knowledge: 85 },
            { championId: 'Karma', knowledge: 80 },
            { championId: 'Milio', knowledge: 75 },
            { championId: 'Lux', knowledge: 70 },
        ],
        popularity: 65, moral: 70, fatigue: 20,
    },
]

export function getPlayersByRole(role: string): Player[] {
    return ALL_PLAYERS.filter(p => p.role === role)
}
