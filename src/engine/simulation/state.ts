import type { Player, TeamState, PlayerState } from '@/types/game.types'
import { ROLES } from '@/types/game.types'
import {
    PLAYER_HP, GOLD_PER_FARM, GOLD_MULT_CAP, REFERENCE_GOLD, ROLE_WEIGHTS,
    TOWER_HITS, BOT_ADC_FARM_SHARE, BOT_SUP_FARM_SHARE, DRAGON_BUFF, BARON_MULT,
} from './constants'
import { getKnowledge, FALLBACK_PLAYER, rand } from './helpers'

export function initTeamState(
    label: 'player' | 'opponent',
    roster: Player[],
    picks: Record<string, string>,
): TeamState {
    const playerStates: PlayerState[] = ROLES.map(role => {
        const player = roster.find(p => p.role === role) ?? { ...FALLBACK_PLAYER, role }
        const champId = picks[role] ?? ''
        const knowledge = getKnowledge(player, champId)
        return {
            player,
            pickedChampionId: champId,
            gold: 0,
            hp: PLAYER_HP,
            deadUntilTurn: null,
            dragonStacks: 0,
            baronActive: false,
            baronTurnsRemaining: 0,
            knowledgeMult: 0.5 + 0.5 * (knowledge / 100),
            fatigueMult: 1 - player.fatigue / 200,
            moralMult: 0.8 + player.moral / 500,
        }
    })
    return {
        label,
        playerStates,
        totalGold: 0,
        goldMultiplier: 1,
        dragonCount: 0,
        towers: {
            top: { outer: TOWER_HITS, inner: TOWER_HITS },
            mid: { outer: TOWER_HITS, inner: TOWER_HITS },
            bot: { outer: TOWER_HITS, inner: TOWER_HITS },
        },
    }
}

export function updateGoldMultiplier(team: TeamState): void {
    team.totalGold = team.playerStates.reduce((s, ps) => s + ps.gold, 0)
    team.goldMultiplier = Math.min(GOLD_MULT_CAP, 1 + (team.totalGold / REFERENCE_GOLD) * 0.3)
}

export function farmTick(team: TeamState, turn: number): void {
    for (const ps of team.playerStates) {
        if (ps.deadUntilTurn !== null && turn < ps.deadUntilTurn) continue
        if (ps.deadUntilTurn !== null && turn >= ps.deadUntilTurn) {
            ps.deadUntilTurn = null
            ps.hp = PLAYER_HP
        }
        const w = ROLE_WEIGHTS[ps.player.role]
        const farmStat = ps.player.stats.farm * w.farm + ps.player.stats.mechanics * w.mechanics * 0.2
        let share = 1
        if (ps.player.role === 'adc') share = BOT_ADC_FARM_SHARE
        else if (ps.player.role === 'support') share = BOT_SUP_FARM_SHARE
        ps.gold += farmStat * GOLD_PER_FARM * ps.knowledgeMult * ps.fatigueMult * ps.moralMult * share
    }
    updateGoldMultiplier(team)
}

export function teamfightPower(team: TeamState, weightMechanics = 0.4, weightTeamfight = 0.6): number {
    const sum = team.playerStates.reduce((s, ps) => {
        const w = ROLE_WEIGHTS[ps.player.role]
        const base = ps.player.stats.mechanics * weightMechanics + ps.player.stats.teamfight * weightTeamfight
        const dragonBuff = 1 + ps.dragonStacks * DRAGON_BUFF
        const baronBuff = ps.baronActive ? BARON_MULT : 1
        return s + base * ps.knowledgeMult * ps.fatigueMult * ps.moralMult * dragonBuff * baronBuff
    }, 0)
    return (sum / team.playerStates.length) * team.goldMultiplier * rand(0.85, 1.15)
}
