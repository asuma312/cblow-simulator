import type { Player } from '@/types/game.types'

export function rand(min: number, max: number): number {
    return min + Math.random() * (max - min)
}

export function randInt(min: number, max: number): number {
    return Math.floor(rand(min, max + 1))
}

export function getKnowledge(p: Player, champId: string): number {
    return p.champPool.find(c => c.championId === champId)?.knowledge ?? 60
}

export const FALLBACK_PLAYER: Player = {
    id: 'fallback', name: 'Unknown', nickname: '???', role: 'top',
    stats: { farm: 5, mechanics: 5, teamfight: 5 },
    champPool: [], popularity: 50, moral: 50, fatigue: 0,
}
