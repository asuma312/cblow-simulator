<template>
    <div class="tournament-view">
        <div class="tournament-header">
            <div>
                <h1 class="tournament-title">CBlow Championship 2026</h1>
                <p class="tournament-week">Semana {{ tournamentStore.week }}</p>
            </div>
            <div class="player-status">
                <p class="player-team-name">{{ teamStore.teamName }}</p>
                <p class="player-budget">Orçamento: R$ {{ teamStore.budget.toLocaleString('pt-BR') }}</p>
            </div>
        </div>

        <div v-if="tournamentStore.isPlayerEliminated" class="eliminated-banner">
            <p>Seu time foi eliminado!</p>
        </div>

        <div v-if="tournamentStore.hasPlayerWon" class="champion-banner">
            <p>VOCÊ É O CAMPEÃO DO CBLOW!</p>
        </div>

        <div class="tournament-content">
            <BracketView
                :matches="tournamentStore.matches"
                :playerTeamId="tournamentStore.playerTeamId"
                :playerTeamName="teamStore.teamName"
            />
        </div>

        <div class="tournament-actions">
            <!-- Next match info -->
            <div v-if="nextMatch && !tournamentStore.isPlayerEliminated && !tournamentStore.hasPlayerWon" class="next-match-card">
                <p class="next-match-label">PRÓXIMA PARTIDA</p>
                <p class="next-match-info">
                    {{ teamStore.teamName }} vs {{ getOpponentName(nextMatch) }}
                </p>
                <p class="next-match-format">
                    Formato: {{ nextMatch.format.toUpperCase() }} •
                    {{ nextMatch.bracket === 'winners' ? 'Winners Bracket' : nextMatch.bracket === 'losers' ? 'Losers Bracket' : 'Grand Final' }}
                </p>
            </div>

            <div class="action-buttons">
                <button
                    v-if="!tournamentStore.isPlayerEliminated && !tournamentStore.hasPlayerWon && nextMatch"
                    class="action-btn action-btn--primary"
                    @click="goToTraining"
                >
                    TREINAR ANTES DA PARTIDA
                </button>

                <button
                    v-if="!tournamentStore.isPlayerEliminated && !tournamentStore.hasPlayerWon && nextMatch"
                    class="action-btn action-btn--skip"
                    @click="skipTraining"
                >
                    PULAR TREINO E IR DIRETO
                </button>

                <button
                    v-if="tournamentStore.isPlayerEliminated || tournamentStore.hasPlayerWon"
                    class="action-btn action-btn--end"
                    @click="goToGameOver"
                >
                    VER RESULTADO FINAL
                </button>
            </div>
        </div>

        <!-- Eliminated teams -->
        <div v-if="tournamentStore.eliminated.length > 0" class="eliminated-list">
            <p class="eliminated-title">Times eliminados:</p>
            <div class="eliminated-teams">
                <span v-for="teamId in tournamentStore.eliminated" :key="teamId" class="eliminated-team">
                    {{ getTeamName(teamId) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTournamentStore } from '@/stores/tournament'
import { useTeamStore } from '@/stores/team'
import { useGameStore } from '@/stores/game'
import { useChampionsStore } from '@/stores/champions'
import { AI_TEAMS } from '@/data/teams'
import type { Match } from '@/types/game.types'
import BracketView from '@/components/tournament/BracketView.vue'

const router = useRouter()
const tournamentStore = useTournamentStore()
const teamStore = useTeamStore()
const gameStore = useGameStore()
const champStore = useChampionsStore()

const nextMatch = computed(() => tournamentStore.playerNextMatch)

const getTeamName = (id: string): string => {
    if (id === 'player') return teamStore.teamName
    if (id === 'TBD') return '???'
    return AI_TEAMS.find(t => t.id === id)?.name ?? id
}

const getOpponentName = (match: Match): string => {
    const oppId = match.teamA === 'player' ? match.teamB : match.teamA
    return getTeamName(oppId)
}

const goToTraining = () => {
    if (nextMatch.value) {
        tournamentStore.setCurrentMatch(nextMatch.value.id)
    }
    gameStore.setPhase('training')
    router.push('/training')
}

const skipTraining = () => {
    if (nextMatch.value) {
        tournamentStore.setCurrentMatch(nextMatch.value.id)
    }
    gameStore.seriesScores = { player: 0, opponent: 0 }
    gameStore.currentGameInSeries = 1
    gameStore.setPhase('champselect')
    champStore.resetDraft()
    router.push('/champselect')
}

const goToGameOver = () => {
    if (tournamentStore.hasPlayerWon) {
        gameStore.setPhase('victory')
    } else {
        gameStore.setPhase('gameover')
    }
    router.push('/gameover')
}
</script>

<style lang="scss" scoped>
.tournament-view {
    min-height: 100vh;
    background: #1a0d06;
    padding: 20px;
    max-width: 1100px;
    margin: 0 auto;
}

.tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(139, 94, 60, 0.3);
}

.tournament-title {
    font-size: 22px;
    font-weight: 700;
    color: #C8860A;
    letter-spacing: 0.1em;
}

.tournament-week {
    font-size: 12px;
    color: rgba(245, 240, 232, 0.4);
    margin-top: 4px;
}

.player-status {
    text-align: right;
}

.player-team-name {
    font-size: 16px;
    font-weight: 700;
    color: #F5F0E8;
}

.player-budget {
    font-size: 12px;
    color: #22c55e;
    margin-top: 4px;
}

.eliminated-banner {
    padding: 12px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    text-align: center;
    color: #ef4444;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-bottom: 16px;
    font-size: 16px;
}

.champion-banner {
    padding: 16px;
    background: rgba(200, 134, 10, 0.2);
    border: 1px solid rgba(200, 134, 10, 0.5);
    text-align: center;
    color: #C8860A;
    font-weight: 700;
    font-size: 20px;
    letter-spacing: 0.1em;
    margin-bottom: 16px;
    box-shadow: 0 0 24px rgba(200, 134, 10, 0.3);
}

.tournament-content {
    margin-bottom: 24px;
}

.tournament-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;
}

.next-match-card {
    text-align: center;
    padding: 16px 24px;
    background: rgba(200, 134, 10, 0.08);
    border: 1px solid rgba(200, 134, 10, 0.3);
    width: 100%;
    max-width: 500px;
}

.next-match-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: rgba(200, 134, 10, 0.6);
    text-transform: uppercase;
    margin-bottom: 6px;
}

.next-match-info {
    font-size: 18px;
    font-weight: 700;
    color: #F5F0E8;
    margin-bottom: 4px;
}

.next-match-format {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.4);
    letter-spacing: 0.06em;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
}

.action-btn {
    padding: 12px 32px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    min-width: 280px;

    &--primary {
        background: linear-gradient(180deg, #C8860A 0%, #8B5E3C 100%);
        color: #1a0d06;
        clip-path: polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px);
    }

    &--primary:hover {
        background: linear-gradient(180deg, #e8a020 0%, #C8860A 100%);
        box-shadow: 0 0 20px rgba(200, 134, 10, 0.4);
    }

    &--skip {
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(139, 94, 60, 0.4);
        color: rgba(245, 240, 232, 0.5);
        font-size: 12px;
    }

    &--skip:hover {
        border-color: #C8860A;
        color: #C8860A;
    }

    &--end {
        background: linear-gradient(180deg, #C8860A 0%, #8B5E3C 100%);
        color: #1a0d06;
        clip-path: polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px);
    }
}

.eliminated-list {
    padding: 12px;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(139, 94, 60, 0.2);
}

.eliminated-title {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.4);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.eliminated-teams {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.eliminated-team {
    font-size: 11px;
    color: rgba(239, 68, 68, 0.6);
    padding: 2px 8px;
    border: 1px solid rgba(239, 68, 68, 0.3);
    text-decoration: line-through;
}
</style>
