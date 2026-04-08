import type { Role } from '@/types/game.types'
import { ALL_CHAMPIONS } from '@/data/champions'

function normalize(name: string): string {
    return name.toLowerCase().replace(/[^a-z]/g, '')
}

// { "aatrox_top": { "heimerdinger": 55.63, ... } }
const matchupMap = new Map<string, Map<string, number>>()

for (const champ of ALL_CHAMPIONS) {
    if (!champ.matchups) continue
    for (const [role, opponents] of Object.entries(champ.matchups)) {
        const key = normalize(champ.id) + '_' + role  // role já vem como 'middle' nos JSONs
        const oppMap = new Map<string, number>()
        for (const [oppName, winRate] of Object.entries(opponents)) {
            oppMap.set(normalize(oppName), winRate)
        }
        matchupMap.set(key, oppMap)
    }
}

/**
 * Retorna o multiplicador de matchup para champId (na role) contra opponentChampId.
 * winRate > 50 → bônus para champId; < 50 → penalidade.
 * Fórmula: 1 + (winRate - 50) * 0.20  →  51% = +20%, 55% = +100%
 */
export function getMatchupMult(champId: string, role: Role, opponentChampId: string): number {
    const key = normalize(champId) + '_' + (role === 'mid' ? 'middle' : role)
    const opponents = matchupMap.get(key)
    if (!opponents) return 1.0

    const winRate = opponents.get(normalize(opponentChampId))
    if (winRate === undefined) return 1.0

    if (winRate <= 50) return 1.0
    return 1 + (winRate - 50) * 0.20
}
