import type { AITeam } from '@/types/game.types'
import { AI_TEAMS } from '@/data/teams'

const ARCHETYPE_DATA: Record<string, { label: string; color: string }> = {
    campeoes:    { label: 'Campeões',        color: '#C8860A' },
    finalistas:  { label: 'Finalistas',      color: '#f87171' },
    mecanica:    { label: 'Mecânica Pura',   color: '#60a5fa' },
    underdog:    { label: 'Underdog',        color: '#4ade80' },
    equilibrados:{ label: 'Equilibrados',    color: '#a78bfa' },
    tecnicos:    { label: 'Técnicos',        color: '#38bdf8' },
    rookies:     { label: 'Novatos',         color: '#94a3b8' },
    irregulares: { label: 'Imprevisíveis',   color: '#fb923c' },
}

export function getAITeamById(teamId: string): AITeam | null {
    return AI_TEAMS.find(t => t.id === teamId) ?? null
}

export function getAITeamPower(team: AITeam): number {
    const statSum = team.roster.reduce((sum, p) => sum + p.stats.farm + p.stats.mechanics + p.stats.teamfight, 0)
    return (statSum / 150) * 10
}

export function getArchetypeLabel(archetype: string): string {
    return ARCHETYPE_DATA[archetype]?.label ?? archetype
}

export function getArchetypeColor(archetype: string): string {
    return ARCHETYPE_DATA[archetype]?.color ?? '#F5F0E8'
}

export function getAITeamPicks(team: AITeam, pickedSoFar: string[]): Record<string, string> {
    const picks: Record<string, string> = {}
    for (const player of team.roster) {
        const sorted = [...player.champPool].sort((a, b) => b.knowledge - a.knowledge)
        const champ = sorted.find(c => !pickedSoFar.includes(c.championId))
        picks[player.role] = champ?.championId ?? 'Garen'
        if (champ) pickedSoFar.push(champ.championId)
    }
    return picks
}
