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

export function stepToward(
    current: { x: number; y: number },
    target:  { x: number; y: number },
    speed:   number,
): { x: number; y: number } {
    const dx = target.x - current.x
    const dy = target.y - current.y
    const d  = Math.sqrt(dx * dx + dy * dy)
    if (d <= speed) return { ...target }
    return { x: current.x + dx / d * speed, y: current.y + dy / d * speed }
}

export const FALLBACK_PLAYER: Player = {
    id: 'fallback', name: 'Unknown', nickname: '???', role: 'top',
    stats: { farm: 5, mechanics: 5, teamfight: 5 },
    champPool: [], popularity: 50, moral: 50, fatigue: 0,
}
