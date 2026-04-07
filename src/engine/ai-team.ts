import type { AITeam, Player } from '@/types/game.types'
import { AI_TEAMS } from '@/data/teams'

export function getAITeamById(teamId: string): AITeam | null {
    return AI_TEAMS.find(t => t.id === teamId) ?? null
}

/**
 * Calculate a rough power rating for an AI team (0-10 scale)
 */
export function getAITeamPower(team: AITeam): number {
    const statSum = team.roster.reduce((sum, p) => {
        return sum + p.stats.farm + p.stats.mechanics + p.stats.teamfight
    }, 0)
    // Max possible: 5 players * 30 = 150 -> scale to 10
    return (statSum / 150) * 10
}

/**
 * Get archetype description for display
 */
export function getArchetypeLabel(archetype: string): string {
    const labels: Record<string, string> = {
        favorites: 'Favoritos',
        grinders: 'Máquinas de CS',
        mechanics: 'Mecânica Pura',
        teamfighters: 'Teamfighters',
        inconsistentes: 'Imprevisíveis',
        rookies: 'Novatos',
        streamers: 'Streamers',
    }
    return labels[archetype] ?? archetype
}

/**
 * Get a color class for archetype
 */
export function getArchetypeColor(archetype: string): string {
    const colors: Record<string, string> = {
        favorites: '#C8860A',
        grinders: '#4ade80',
        mechanics: '#60a5fa',
        teamfighters: '#f87171',
        inconsistentes: '#a78bfa',
        rookies: '#94a3b8',
        streamers: '#f472b6',
    }
    return colors[archetype] ?? '#F5F0E8'
}

/**
 * Get picks for AI team given a draft slot
 */
export function getAITeamPicks(team: AITeam, pickedSoFar: string[]): Record<string, string> {
    const picks: Record<string, string> = {}
    for (const player of team.roster) {
        // Pick best available champion
        const sorted = [...player.champPool].sort((a, b) => b.knowledge - a.knowledge)
        for (const champ of sorted) {
            if (!pickedSoFar.includes(champ.championId)) {
                picks[player.role] = champ.championId
                pickedSoFar.push(champ.championId)
                break
            }
        }
        if (!picks[player.role]) {
            picks[player.role] = 'Garen' // fallback
        }
    }
    return picks
}
