import type { Player } from '@/types/game.types'

const SLOT_ROLES = ['top', 'jungle', 'mid', 'adc', 'support'] as const

type ChampionEntry = { id: string; name: string }

function isAvailable(id: string, name: string, unavailable: string[]): boolean {
    const blocked = new Set(unavailable.map(u => u.toLowerCase()))
    return !blocked.has(id.toLowerCase()) && !blocked.has(name.toLowerCase())
}

function pickRandom(available: ChampionEntry[], fallback = 'Garen'): string {
    return available.length > 0
        ? available[Math.floor(Math.random() * available.length)].id
        : fallback
}

function getAvailable(unavailable: string[], allChampions: ChampionEntry[]): ChampionEntry[] {
    return allChampions.filter(c => isAvailable(c.id, c.name, unavailable))
}

function resolveChampionId(name: string, allChampions: ChampionEntry[]): string | null {
    return allChampions.find(
        c => c.name.toLowerCase() === name.toLowerCase() || c.id.toLowerCase() === name.toLowerCase()
    )?.id ?? null
}

const BAN_FALLBACKS = [
    'Jinx', 'Caitlyn', 'Zed', 'Thresh', 'Lee Sin',
    'Azir', 'Orianna', 'Graves', 'Camille', 'Yasuo',
]

export function getAIBans(playerRoster: Player[], unavailable: string[], banCount = 5): string[] {
    const candidates = playerRoster
        .flatMap(p => p.champPool)
        .filter(c => c.knowledge > 70 && !unavailable.includes(c.championId))
        .sort((a, b) => b.knowledge - a.knowledge)

    const bans: string[] = []
    const seen = new Set<string>()

    for (const c of [...candidates.map(c => c.championId), ...BAN_FALLBACKS]) {
        if (bans.length >= banCount) break
        if (!seen.has(c) && !unavailable.includes(c)) {
            seen.add(c)
            bans.push(c)
        }
    }

    return bans
}

export function getAIPick(
    aiRoster: Player[],
    slotIndex: number,
    unavailable: string[],
    allChampions: ChampionEntry[]
): string {
    const role = SLOT_ROLES[slotIndex]
    const player = role ? aiRoster.find(p => p.role === role) : null

    if (player) {
        const sorted = [...player.champPool].sort((a, b) => b.knowledge - a.knowledge)
        for (const champ of sorted) {
            const id = resolveChampionId(champ.championId, allChampions)
            if (id && isAvailable(id, champ.championId, unavailable)) return id
        }
    }

    return pickRandom(getAvailable(unavailable, allChampions))
}

export function getRandomAIBan(unavailable: string[], allChampions: ChampionEntry[]): string {
    return pickRandom(getAvailable(unavailable, allChampions), '')
}
