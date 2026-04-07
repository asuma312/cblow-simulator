<template>
    <div class="bracket-view">
        <div class="bracket-section">
            <h3 class="bracket-title">Winners Bracket</h3>
            <div class="bracket-rounds">
                <div v-for="round in winnerRounds" :key="round.label" class="bracket-round">
                    <p class="round-label">{{ round.label }}</p>
                    <div v-for="match in round.matches" :key="match.id" class="bracket-match"
                        :class="{
                            'bracket-match--player': isPlayerMatch(match),
                            'bracket-match--done': match.winner,
                        }"
                    >
                        <div class="match-team" :class="{ 'match-team--winner': match.winner === match.teamA }">
                            <span class="team-name">{{ getTeamName(match.teamA) }}</span>
                            <span v-if="isPlayerTeam(match.teamA)" class="you-badge">VOCÊ</span>
                        </div>
                        <div class="match-vs">VS</div>
                        <div class="match-team" :class="{ 'match-team--winner': match.winner === match.teamB }">
                            <span class="team-name">{{ getTeamName(match.teamB) }}</span>
                            <span v-if="isPlayerTeam(match.teamB)" class="you-badge">VOCÊ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bracket-section">
            <h3 class="bracket-title bracket-title--losers">Losers Bracket</h3>
            <div class="bracket-rounds">
                <div v-for="round in loserRounds" :key="round.label" class="bracket-round">
                    <p class="round-label">{{ round.label }}</p>
                    <div v-for="match in round.matches" :key="match.id" class="bracket-match bracket-match--losers"
                        :class="{
                            'bracket-match--player': isPlayerMatch(match),
                            'bracket-match--done': match.winner,
                        }"
                    >
                        <div class="match-team" :class="{ 'match-team--winner': match.winner === match.teamA }">
                            <span class="team-name">{{ getTeamName(match.teamA) }}</span>
                            <span v-if="isPlayerTeam(match.teamA)" class="you-badge">VOCÊ</span>
                        </div>
                        <div class="match-vs">VS</div>
                        <div class="match-team" :class="{ 'match-team--winner': match.winner === match.teamB }">
                            <span class="team-name">{{ getTeamName(match.teamB) }}</span>
                            <span v-if="isPlayerTeam(match.teamB)" class="you-badge">VOCÊ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="grandFinal" class="bracket-section bracket-gf">
            <h3 class="bracket-title bracket-title--gf">Grand Final</h3>
            <div class="bracket-match bracket-match--gf"
                :class="{
                    'bracket-match--player': isPlayerMatch(grandFinal),
                    'bracket-match--done': grandFinal.winner,
                }"
            >
                <div class="match-team" :class="{ 'match-team--winner': grandFinal.winner === grandFinal.teamA }">
                    <span class="team-name">{{ getTeamName(grandFinal.teamA) }}</span>
                    <span v-if="isPlayerTeam(grandFinal.teamA)" class="you-badge">VOCÊ</span>
                </div>
                <div class="match-vs">VS</div>
                <div class="match-team" :class="{ 'match-team--winner': grandFinal.winner === grandFinal.teamB }">
                    <span class="team-name">{{ getTeamName(grandFinal.teamB) }}</span>
                    <span v-if="isPlayerTeam(grandFinal.teamB)" class="you-badge">VOCÊ</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Match } from '@/types/game.types'
import { AI_TEAMS } from '@/data/teams'

const props = defineProps({
    matches: { type: Array as () => Match[], required: true },
    playerTeamId: { type: String, required: true },
    playerTeamName: { type: String, default: 'Seu Time' },
})

const getTeamName = (id: string): string => {
    if (id === props.playerTeamId) return props.playerTeamName
    if (id === 'TBD') return '???'
    const team = AI_TEAMS.find(t => t.id === id)
    return team?.name ?? id
}

const isPlayerTeam = (id: string): boolean => id === props.playerTeamId

const isPlayerMatch = (match: Match): boolean =>
    match.teamA === props.playerTeamId || match.teamB === props.playerTeamId

interface BracketRound {
    label: string
    matches: Match[]
}

const winnerRounds = computed((): BracketRound[] => {
    return [
        { label: 'Quartas', matches: props.matches.filter(m => m.bracket === 'winners' && m.round === 1) },
        { label: 'Semis', matches: props.matches.filter(m => m.bracket === 'winners' && m.round === 2) },
        { label: 'Final WB', matches: props.matches.filter(m => m.bracket === 'winners' && m.round === 3) },
    ]
})

const loserRounds = computed((): BracketRound[] => {
    return [
        { label: 'LB R1', matches: props.matches.filter(m => m.bracket === 'losers' && m.round === 1) },
        { label: 'LB R2', matches: props.matches.filter(m => m.bracket === 'losers' && m.round === 2) },
        { label: 'LB R3', matches: props.matches.filter(m => m.bracket === 'losers' && m.round === 3) },
        { label: 'Final LB', matches: props.matches.filter(m => m.bracket === 'losers' && m.round === 4) },
    ]
})

const grandFinal = computed((): Match | undefined => {
    return props.matches.find(m => m.bracket === 'grand_final')
})
</script>

<style lang="scss" scoped>
.bracket-view {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.bracket-section {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(139, 94, 60, 0.3);
    padding: 16px;
}

.bracket-gf {
    border-color: rgba(200, 134, 10, 0.5);
    box-shadow: 0 0 20px rgba(200, 134, 10, 0.2);
}

.bracket-title {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #C8860A;
    margin-bottom: 12px;
    text-transform: uppercase;

    &--losers {
        color: #ef4444;
    }

    &--gf {
        color: #fbbf24;
        text-align: center;
        font-size: 18px;
    }
}

.bracket-rounds {
    display: flex;
    gap: 16px;
    overflow-x: auto;
}

.bracket-round {
    min-width: 160px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.round-label {
    font-size: 11px;
    font-weight: 700;
    color: rgba(245, 240, 232, 0.4);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 4px;
}

.bracket-match {
    background: #2a1508;
    border: 1px solid rgba(139, 94, 60, 0.3);
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    transition: border-color 0.2s;

    &--player {
        border-color: rgba(200, 134, 10, 0.6);
        box-shadow: 0 0 8px rgba(200, 134, 10, 0.15);
    }

    &--done {
        opacity: 0.8;
    }

    &--losers {
        border-color: rgba(239, 68, 68, 0.2);
    }

    &--gf {
        border-color: rgba(200, 134, 10, 0.5);
        padding: 12px;
        font-size: 14px;
    }
}

.match-team {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px;
    border-radius: 2px;

    &--winner {
        background: rgba(200, 134, 10, 0.2);
        color: #C8860A;
        font-weight: 700;
    }
}

.team-name {
    color: #F5F0E8;
    flex: 1;
}

.match-team--winner .team-name {
    color: #C8860A;
}

.you-badge {
    font-size: 9px;
    font-weight: 700;
    background: #C8860A;
    color: #1a0d06;
    padding: 1px 4px;
    letter-spacing: 0.05em;
}

.match-vs {
    font-size: 9px;
    color: rgba(245, 240, 232, 0.3);
    text-align: center;
    letter-spacing: 0.1em;
}
</style>
