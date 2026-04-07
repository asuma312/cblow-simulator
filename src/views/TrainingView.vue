<template>
    <div class="training-view">
        <div class="training-header">
            <div>
                <h1 class="training-title">SEMANA DE TREINOS</h1>
                <p class="training-week">Semana {{ gameStore.week }} • Antes da próxima partida</p>
            </div>
            <div class="training-budget">
                <p class="budget-label">Orçamento</p>
                <p class="budget-amount">R$ {{ teamStore.budget.toLocaleString('pt-BR') }}</p>
            </div>
        </div>

        <div class="training-grid">
            <div class="training-left">
                <h2 class="section-title">DEFINIR TREINAMENTOS</h2>
                <div class="players-actions">
                    <div v-for="player in teamStore.roster" :key="player.id" class="player-training-row">
                        <div class="player-info-mini">
                            <PlayerCard
                                :player="player"
                                showStatus
                            />
                        </div>
                        <TrainingActionComp
                            :player="player"
                            :currentAction="trainingStore.weeklyPlan[player.id] ?? null"
                            @update:action="(action) => trainingStore.setAction(player.id, action)"
                        />
                    </div>
                </div>
            </div>

            <div class="training-right">
                <h2 class="section-title">RESUMO DA SEMANA</h2>
                <div class="week-summary">
                    <div v-for="player in teamStore.roster" :key="player.id" class="summary-row">
                        <span class="summary-nick">{{ player.nickname }}</span>
                        <span class="summary-action">{{ actionLabel(player.id) }}</span>
                    </div>
                </div>

                <div class="coach-info" v-if="teamStore.coach">
                    <p class="coach-label">Coach: {{ teamStore.coach.name }}</p>
                    <p class="coach-focus">{{ teamStore.coach.focus }}</p>
                </div>

                <div class="training-tips">
                    <h3 class="tips-title">Dicas</h3>
                    <p class="tip">• Jogadores cansados (fadiga alta) rendem menos em partidas</p>
                    <p class="tip">• Moral baixo reduz o desempenho em até 20%</p>
                    <p class="tip">• Streamar traz dinheiro mas não treina habilidades</p>
                    <p class="tip">• Estudar campeões aumenta o conhecimento do pool</p>
                </div>

                <button
                    class="start-week-btn"
                    :disabled="!allPlayersHaveAction"
                    @click="executeWeek"
                >
                    INICIAR SEMANA
                </button>
                <p v-if="!allPlayersHaveAction" class="action-warning">
                    Defina uma ação para cada jogador
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/team'
import { useGameStore } from '@/stores/game'
import { useTrainingStore } from '@/stores/training'
import { getActionLabel } from '@/data/trainingActions'
import PlayerCard from '@/components/shared/PlayerCard.vue'
import TrainingActionComp from '@/components/training/TrainingAction.vue'

const router = useRouter()
const teamStore = useTeamStore()
const gameStore = useGameStore()
const trainingStore = useTrainingStore()

const allPlayersHaveAction = computed(() =>
    teamStore.roster.every(p => trainingStore.weeklyPlan[p.id] !== undefined)
)

const actionLabel = (playerId: string): string => {
    const action = trainingStore.weeklyPlan[playerId]
    return getActionLabel(action?.type, (action as any)?.championId)
}

const executeWeek = () => {
    trainingStore.executeWeek()
    gameStore.advanceWeek()
    gameStore.setPhase('champselect')

    // Reset series for new match
    gameStore.seriesScores = { player: 0, opponent: 0 }
    gameStore.currentGameInSeries = 1

    router.push('/champselect')
}
</script>

<style lang="scss" scoped>
.training-view {
    min-height: 100vh;
    background: #1a0d06;
    padding: 20px;
    max-width: 1100px;
    margin: 0 auto;
}

.training-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(139, 94, 60, 0.3);
}

.training-title {
    font-size: 22px;
    font-weight: 700;
    color: #C8860A;
    letter-spacing: 0.12em;
}

.training-week {
    font-size: 12px;
    color: rgba(245, 240, 232, 0.4);
    margin-top: 4px;
    letter-spacing: 0.06em;
}

.training-budget {
    text-align: right;
}

.budget-label {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.4);
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.budget-amount {
    font-size: 24px;
    font-weight: 700;
    color: #22c55e;
}



.training-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
}

.section-title {
    font-size: 13px;
    font-weight: 700;
    color: rgba(200, 134, 10, 0.7);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(139, 94, 60, 0.2);
}

.players-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.player-training-row {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 12px;
    align-items: start;
}

.player-info-mini {
    min-width: 0;
}

.training-right {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.week-summary {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(139, 94, 60, 0.3);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
}

.summary-nick {
    color: #C8860A;
    font-weight: 700;
}

.summary-action {
    color: rgba(245, 240, 232, 0.6);
    font-size: 11px;
}

.coach-info {
    padding: 12px;
    background: rgba(200, 134, 10, 0.1);
    border: 1px solid rgba(200, 134, 10, 0.3);
}

.coach-label {
    font-size: 13px;
    font-weight: 700;
    color: #C8860A;
}

.coach-focus {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.5);
    margin-top: 2px;
}

.training-tips {
    padding: 12px;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(139, 94, 60, 0.2);
}

.tips-title {
    font-size: 12px;
    font-weight: 700;
    color: rgba(200, 134, 10, 0.7);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.tip {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.4);
    line-height: 1.6;
    letter-spacing: 0.02em;
}

.start-week-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(180deg, #C8860A 0%, #8B5E3C 100%);
    border: none;
    color: #1a0d06;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px);

    &:hover:not(:disabled) {
        background: linear-gradient(180deg, #e8a020 0%, #C8860A 100%);
        box-shadow: 0 0 20px rgba(200, 134, 10, 0.5);
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
}

.action-warning {
    font-size: 11px;
    color: rgba(239, 68, 68, 0.7);
    text-align: center;
    margin-top: -12px;
}
</style>
