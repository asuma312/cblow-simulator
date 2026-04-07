import type { Player } from '@/types/game.types'

export const ALL_PLAYERS: Player[] = [
    // Tops
    {
        id: 'jkfs', name: 'João Kin', nickname: 'JKFS', role: 'top',
        stats: { farm: 7, mechanics: 6, teamfight: 5 },
        champPool: [
            { championId: 'Darius', knowledge: 90 },
            { championId: 'Garen', knowledge: 85 },
            { championId: 'Malphite', knowledge: 70 },
        ],
        salary: 1500, popularity: 55, moral: 70, fatigue: 20,
    },
    {
        id: 'tockers', name: 'Gabriel Santos', nickname: 'Tockers', role: 'top',
        stats: { farm: 6, mechanics: 8, teamfight: 6 },
        champPool: [
            { championId: 'Camille', knowledge: 88 },
            { championId: 'Fiora', knowledge: 80 },
            { championId: 'Riven', knowledge: 75 },
        ],
        salary: 1800, popularity: 65, moral: 75, fatigue: 15,
    },
    {
        id: 'hauz', name: 'Pedro Haus', nickname: 'Hauz', role: 'top',
        stats: { farm: 5, mechanics: 5, teamfight: 8 },
        champPool: [
            { championId: 'Malphite', knowledge: 92 },
            { championId: 'Amumu', knowledge: 78 },
            { championId: 'Ornn', knowledge: 85 },
        ],
        salary: 1200, popularity: 45, moral: 80, fatigue: 25,
    },
    {
        id: 'thaldrin', name: 'Thiago Thaldrin', nickname: 'Thaldrin', role: 'top',
        stats: { farm: 6, mechanics: 7, teamfight: 7 },
        champPool: [
            { championId: 'Aatrox', knowledge: 90 },
            { championId: 'Gragas', knowledge: 82 },
            { championId: 'Renekton', knowledge: 78 },
        ],
        salary: 2000, popularity: 68, moral: 70, fatigue: 20,
    },

    // Jungles
    {
        id: 'shini', name: 'Rodrigo Shini', nickname: 'Shini', role: 'jungle',
        stats: { farm: 8, mechanics: 7, teamfight: 6 },
        champPool: [
            { championId: 'Graves', knowledge: 90 },
            { championId: 'Hecarim', knowledge: 82 },
            { championId: 'Vi', knowledge: 75 },
        ],
        salary: 2000, popularity: 70, moral: 70, fatigue: 20,
    },
    {
        id: 'aegis', name: 'Bruno Aegis', nickname: 'Aegis', role: 'jungle',
        stats: { farm: 6, mechanics: 8, teamfight: 7 },
        champPool: [
            { championId: 'Elise', knowledge: 88 },
            { championId: 'Lee Sin', knowledge: 85 },
            { championId: 'Nidalee', knowledge: 78 },
        ],
        salary: 1800, popularity: 60, moral: 72, fatigue: 18,
    },
    {
        id: 'wiz', name: 'Felipe Wiz', nickname: 'Wiz', role: 'jungle',
        stats: { farm: 5, mechanics: 6, teamfight: 9 },
        champPool: [
            { championId: 'Amumu', knowledge: 90 },
            { championId: 'Zac', knowledge: 85 },
            { championId: 'Sejuani', knowledge: 80 },
        ],
        salary: 1400, popularity: 50, moral: 68, fatigue: 30,
    },
    {
        id: 'apoka', name: 'Thiago Apoka', nickname: 'Apoka', role: 'jungle',
        stats: { farm: 7, mechanics: 5, teamfight: 6 },
        champPool: [
            { championId: 'Warwick', knowledge: 88 },
            { championId: 'Udyr', knowledge: 82 },
            { championId: 'Volibear', knowledge: 76 },
        ],
        salary: 1100, popularity: 40, moral: 75, fatigue: 20,
    },
    {
        id: 'goku', name: 'Luís Goku', nickname: 'Goku', role: 'jungle',
        stats: { farm: 7, mechanics: 8, teamfight: 6 },
        champPool: [
            { championId: 'Lee Sin', knowledge: 90 },
            { championId: 'Jarvan IV', knowledge: 85 },
            { championId: 'Vi', knowledge: 80 },
        ],
        salary: 1900, popularity: 65, moral: 72, fatigue: 22,
    },

    // Mids
    {
        id: 'cordi', name: 'Lucas Cordi', nickname: 'Cordi', role: 'mid',
        stats: { farm: 7, mechanics: 8, teamfight: 6 },
        champPool: [
            { championId: 'Zed', knowledge: 90 },
            { championId: 'Katarina', knowledge: 85 },
            { championId: 'Akali', knowledge: 80 },
        ],
        salary: 2200, popularity: 75, moral: 65, fatigue: 25,
    },
    {
        id: 'envy', name: 'Rafael Envy', nickname: 'Envy', role: 'mid',
        stats: { farm: 8, mechanics: 7, teamfight: 7 },
        champPool: [
            { championId: 'Azir', knowledge: 88 },
            { championId: 'Viktor', knowledge: 84 },
            { championId: 'Orianna', knowledge: 78 },
        ],
        salary: 2500, popularity: 80, moral: 70, fatigue: 20,
    },
    {
        id: 'alan4', name: 'Alan Melo', nickname: '4LaN', role: 'mid',
        stats: { farm: 6, mechanics: 9, teamfight: 5 },
        champPool: [
            { championId: 'Yasuo', knowledge: 92 },
            { championId: 'Yone', knowledge: 88 },
            { championId: 'Irelia', knowledge: 82 },
        ],
        salary: 1900, popularity: 72, moral: 68, fatigue: 22,
    },
    {
        id: 'luci', name: 'Vitor Luci', nickname: 'Luci', role: 'mid',
        stats: { farm: 5, mechanics: 6, teamfight: 8 },
        champPool: [
            { championId: 'Annie', knowledge: 90 },
            { championId: 'Vex', knowledge: 85 },
            { championId: 'Lux', knowledge: 80 },
        ],
        salary: 1300, popularity: 48, moral: 78, fatigue: 15,
    },
    {
        id: 'tinowns', name: 'Daniel Tinowns', nickname: 'Tinowns', role: 'mid',
        stats: { farm: 8, mechanics: 9, teamfight: 7 },
        champPool: [
            { championId: 'Azir', knowledge: 92 },
            { championId: 'Corki', knowledge: 88 },
            { championId: 'Orianna', knowledge: 85 },
        ],
        salary: 3000, popularity: 88, moral: 65, fatigue: 28,
    },

    // ADCs
    {
        id: 'ranger', name: 'Paulo Ranger', nickname: 'Ranger', role: 'adc',
        stats: { farm: 9, mechanics: 7, teamfight: 6 },
        champPool: [
            { championId: 'Jinx', knowledge: 90 },
            { championId: 'Caitlyn', knowledge: 88 },
            { championId: 'Ezreal', knowledge: 82 },
        ],
        salary: 2800, popularity: 85, moral: 72, fatigue: 25,
    },
    {
        id: 'damage', name: 'Diego Damage', nickname: 'Damage', role: 'adc',
        stats: { farm: 7, mechanics: 8, teamfight: 7 },
        champPool: [
            { championId: 'Draven', knowledge: 90 },
            { championId: 'Jhin', knowledge: 85 },
            { championId: 'Sivir', knowledge: 80 },
        ],
        salary: 2200, popularity: 70, moral: 70, fatigue: 20,
    },
    {
        id: 'grevthar', name: 'Marco Grev', nickname: 'Grevthar', role: 'adc',
        stats: { farm: 6, mechanics: 6, teamfight: 8 },
        champPool: [
            { championId: 'Miss Fortune', knowledge: 88 },
            { championId: 'Ashe', knowledge: 84 },
            { championId: 'Samira', knowledge: 78 },
        ],
        salary: 1500, popularity: 55, moral: 75, fatigue: 18,
    },
    {
        id: 'netuno', name: 'Carlos Netuno', nickname: 'Netuno', role: 'adc',
        stats: { farm: 8, mechanics: 5, teamfight: 7 },
        champPool: [
            { championId: 'Tristana', knowledge: 90 },
            { championId: 'Vayne', knowledge: 78 },
            { championId: 'Twitch', knowledge: 82 },
        ],
        salary: 1600, popularity: 58, moral: 80, fatigue: 22,
    },

    // Supports
    {
        id: 'redbert', name: 'Roberto Red', nickname: 'RedBert', role: 'support',
        stats: { farm: 4, mechanics: 7, teamfight: 8 },
        champPool: [
            { championId: 'Thresh', knowledge: 90 },
            { championId: 'Leona', knowledge: 85 },
            { championId: 'Nautilus', knowledge: 80 },
        ],
        salary: 1700, popularity: 62, moral: 72, fatigue: 20,
    },
    {
        id: 'loop', name: 'André Loop', nickname: 'Loop', role: 'support',
        stats: { farm: 3, mechanics: 6, teamfight: 9 },
        champPool: [
            { championId: 'Alistar', knowledge: 92 },
            { championId: 'Malphite', knowledge: 80 },
            { championId: 'Blitzcrank', knowledge: 85 },
        ],
        salary: 1400, popularity: 50, moral: 78, fatigue: 15,
    },
    {
        id: 'mayumi', name: 'Mayara Santos', nickname: 'Mayumi', role: 'support',
        stats: { farm: 5, mechanics: 8, teamfight: 7 },
        champPool: [
            { championId: 'Lulu', knowledge: 92 },
            { championId: 'Nami', knowledge: 88 },
            { championId: 'Sona', knowledge: 85 },
        ],
        salary: 1600, popularity: 68, moral: 80, fatigue: 12,
    },
    {
        id: 'micao', name: 'Michel Micão', nickname: 'micaO', role: 'support',
        stats: { farm: 4, mechanics: 7, teamfight: 9 },
        champPool: [
            { championId: 'Braum', knowledge: 90 },
            { championId: 'Rakan', knowledge: 88 },
            { championId: 'Galio', knowledge: 75 },
        ],
        salary: 2000, popularity: 72, moral: 70, fatigue: 25,
    },
]

export function getPlayersByRole(role: string): Player[] {
    return ALL_PLAYERS.filter(p => p.role === role)
}
