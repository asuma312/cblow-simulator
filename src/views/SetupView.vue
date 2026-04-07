<template>
    <div class="setup-view">
        <div class="setup-header">
            <button class="back-btn" @click="$router.push('/')">Voltar</button>
            <h1 class="setup-title">CRIAR SEU TIME</h1>
            <div class="step-indicators">
                <div v-for="i in 3" :key="i" class="step-dot" :class="{ 'step-dot--active': step === i, 'step-dot--done': step > i }">
                    {{ i }}
                </div>
            </div>
        </div>

        <!-- Step 1: Team Name -->
        <div v-if="step === 1" class="setup-section animate-float-up">
            <h2 class="section-title">NOME DO TIME</h2>
            <p class="section-desc">Escolha o nome que vai entrar para a história do low elo brasileiro</p>
            <div class="name-input-wrapper">
                <input
                    v-model="teamName"
                    class="name-input"
                    type="text"
                    placeholder="Ex: Team Feeder, Trollers FC..."
                    maxlength="30"
                    @keyup.enter="step = 2"
                />
                <p class="name-counter">{{ teamName.length }}/30</p>
            </div>
            <button class="setup-btn" :disabled="teamName.trim().length < 2" @click="step = 2">
                PRÓXIMO
            </button>
        </div>

        <!-- Step 2: Choose Coach -->
        <div v-if="step === 2" class="setup-section animate-float-up">
            <h2 class="section-title">ESCOLHA SEU COACH</h2>
            <p class="section-desc">O coach define a estratégia e os bônus do seu time</p>
            <div class="coaches-grid">
                <div
                    v-for="coach in coaches"
                    :key="coach.id"
                    class="coach-card"
                    :class="{ 'coach-card--selected': selectedCoach?.id === coach.id }"
                    @click="selectedCoach = coach"
                >
                    <div class="coach-icon">[ ]</div>
                    <h3 class="coach-name">{{ coach.name }}</h3>
                    <p class="coach-focus">Focus: {{ coach.focus }}</p>
                    <p class="coach-desc">{{ coach.description }}</p>
                    <div class="coach-bonus">
                        <p v-if="coach.bonus.teamfightMultiplier">+{{ ((coach.bonus.teamfightMultiplier - 1) * 100).toFixed(0) }}% teamfight</p>
                        <p v-if="coach.bonus.mechanicsTrainBonus">+{{ (coach.bonus.mechanicsTrainBonus * 100).toFixed(0) }}% treino de mecânica</p>
                        <p v-if="coach.bonus.farmEarlyBonus">+{{ ((coach.bonus.farmEarlyBonus - 1) * 100).toFixed(0) }}% farm/early</p>
                        <p v-if="coach.bonus.moralDecayReduction">-{{ (coach.bonus.moralDecayReduction * 100).toFixed(0) }}% decaimento moral</p>
                    </div>
                </div>
            </div>
            <div class="setup-nav">
                <button class="setup-btn setup-btn--secondary" @click="step = 1">Voltar</button>
                <button class="setup-btn" :disabled="!selectedCoach" @click="step = 3">
                    PRÓXIMO
                </button>
            </div>
        </div>

        <!-- Step 3: Choose Players -->
        <div v-if="step === 3" class="setup-section animate-float-up">
            <h2 class="section-title">MONTAR ROSTER</h2>
            <div class="budget-bar">
                <span class="budget-label">Orçamento:</span>
                <span class="budget-amount" :class="{ 'budget-over': remainingBudget < 0 }">
                    R$ {{ remainingBudget.toLocaleString('pt-BR') }}
                </span>
                <span class="budget-total">/ R$ {{ BUDGET.toLocaleString('pt-BR') }}</span>
            </div>

            <div class="role-tabs">
                <button
                    v-for="role in roles"
                    :key="role.id"
                    class="role-tab"
                    :class="{
                        'role-tab--active': selectedRole === role.id,
                        'role-tab--filled': getRosterPlayer(role.id),
                    }"
                    @click="selectedRole = role.id"
                >
                    {{ role.label }}
                    <span v-if="getRosterPlayer(role.id)" class="role-filled-badge">OK</span>
                </button>
            </div>

            <div class="players-grid">
                <PlayerCard
                    v-for="player in availablePlayers"
                    :key="player.id"
                    :player="player"
                    :selected="getRosterPlayer(selectedRole)?.id === player.id"
                    clickable
                    showSalary
                    showPool
                    @click="selectPlayer(player)"
                />
            </div>

            <div class="roster-summary">
                <h3 class="summary-title">Seu Roster</h3>
                <div class="roster-list">
                    <div v-for="role in roles" :key="role.id" class="roster-slot">
                        <span class="roster-role">{{ role.label }}</span>
                        <span class="roster-player" :class="{ 'roster-player--empty': !getRosterPlayer(role.id) }">
                            {{ getRosterPlayer(role.id)?.nickname ?? '---' }}
                        </span>
                        <span v-if="getRosterPlayer(role.id)" class="roster-salary">
                            R$ {{ getRosterPlayer(role.id)?.salary.toLocaleString('pt-BR') }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="setup-nav">
                <button class="setup-btn setup-btn--secondary" @click="step = 2">Voltar</button>
                <button
                    class="setup-btn"
                    :disabled="!isRosterComplete || remainingBudget < 0"
                    @click="confirmSetup"
                >
                    CONFIRMAR TIME
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/team'
import { useGameStore } from '@/stores/game'
import { useTournamentStore } from '@/stores/tournament'
import { COACHES } from '@/data/coaches'
import { ALL_PLAYERS, getPlayersByRole } from '@/data/players'
import type { Player, Coach } from '@/types/game.types'
import PlayerCard from '@/components/shared/PlayerCard.vue'

const router = useRouter()
const teamStore = useTeamStore()
const gameStore = useGameStore()
const tournamentStore = useTournamentStore()

const BUDGET = 10000
const step = ref(1)
const teamName = ref(teamStore.teamName || '')
const selectedCoach = ref<Coach | null>(teamStore.coach)
const selectedRole = ref('top')
const roster = ref<Record<string, Player>>({})

// Pre-fill from store
for (const p of teamStore.roster) {
    roster.value[p.role] = p
}

const roles = [
    { id: 'top', label: 'Top' },
    { id: 'jungle', label: 'Jungle' },
    { id: 'mid', label: 'Mid' },
    { id: 'adc', label: 'ADC' },
    { id: 'support', label: 'Suporte' },
]

const coaches = COACHES

const availablePlayers = computed(() => getPlayersByRole(selectedRole.value))

const getRosterPlayer = (role: string) => roster.value[role] ?? null

const totalSalary = computed(() =>
    Object.values(roster.value).reduce((sum, p) => sum + p.salary, 0)
)

const remainingBudget = computed(() => BUDGET - totalSalary.value)

const isRosterComplete = computed(() =>
    roles.every(r => roster.value[r.id])
)

const selectPlayer = (player: Player) => {
    roster.value[player.role] = { ...player }
}

const confirmSetup = () => {
    teamStore.setTeamName(teamName.value)
    if (selectedCoach.value) teamStore.selectCoach(selectedCoach.value)
    teamStore.budget = remainingBudget.value + (teamStore.budget - BUDGET > 0 ? teamStore.budget - BUDGET : 0)
    // Reset budget to remaining
    teamStore.budget = remainingBudget.value

    for (const player of Object.values(roster.value)) {
        teamStore.addPlayer(player)
    }

    // Init tournament
    tournamentStore.initTournament('player')

    // Simulate AI-only matches that are available immediately
    tournamentStore.simulateAIMatches()

    gameStore.setPhase('tournament')
    router.push('/tournament')
}
</script>

<style lang="scss" scoped>
.setup-view {
    min-height: 100vh;
    background: #1a0d06;
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
}

.setup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(139, 94, 60, 0.3);
}

.back-btn {
    background: transparent;
    border: 1px solid rgba(139, 94, 60, 0.5);
    color: rgba(245, 240, 232, 0.5);
    padding: 6px 12px;
    cursor: pointer;
    font-size: 12px;
    letter-spacing: 0.06em;
    transition: all 0.2s;
}

.back-btn:hover {
    border-color: #C8860A;
    color: #C8860A;
}

.setup-title {
    font-size: 20px;
    font-weight: 700;
    color: #C8860A;
    letter-spacing: 0.15em;
}

.step-indicators {
    display: flex;
    gap: 8px;
}

.step-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid rgba(139, 94, 60, 0.5);
    color: rgba(245, 240, 232, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    transition: all 0.3s;

    &--active {
        border-color: #C8860A;
        color: #C8860A;
        box-shadow: 0 0 8px rgba(200, 134, 10, 0.4);
    }

    &--done {
        background: #C8860A;
        border-color: #C8860A;
        color: #1a0d06;
    }
}

.setup-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #C8860A;
    letter-spacing: 0.12em;
}

.section-desc {
    font-size: 13px;
    color: rgba(245, 240, 232, 0.5);
    letter-spacing: 0.04em;
    margin-top: -12px;
}

.name-input-wrapper {
    position: relative;
}

.name-input {
    width: 100%;
    max-width: 400px;
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(139, 94, 60, 0.5);
    border-bottom: 2px solid #C8860A;
    color: #F5F0E8;
    padding: 12px 16px;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.08em;
    outline: none;
    transition: border-color 0.2s;

    &::placeholder {
        color: rgba(245, 240, 232, 0.25);
        font-weight: 400;
    }

    &:focus {
        border-color: #C8860A;
        box-shadow: 0 0 16px rgba(200, 134, 10, 0.2);
    }
}

.name-counter {
    font-size: 10px;
    color: rgba(245, 240, 232, 0.3);
    text-align: right;
    max-width: 400px;
    margin-top: 4px;
}

.setup-btn {
    align-self: flex-end;
    padding: 12px 28px;
    background: linear-gradient(180deg, #C8860A 0%, #8B5E3C 100%);
    border: none;
    color: #1a0d06;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px);

    &:hover:not(:disabled) {
        background: linear-gradient(180deg, #e8a020 0%, #C8860A 100%);
        box-shadow: 0 0 16px rgba(200, 134, 10, 0.4);
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    &--secondary {
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(139, 94, 60, 0.5);
        color: rgba(245, 240, 232, 0.6);
        clip-path: none;
    }
}

.setup-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}

.coaches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.coach-card {
    background: #2a1508;
    border: 1px solid rgba(139, 94, 60, 0.4);
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px);

    &:hover {
        border-color: #C8860A;
        box-shadow: 0 0 12px rgba(200, 134, 10, 0.2);
    }

    &--selected {
        border-color: #C8860A;
        background: #3a2010;
        box-shadow: 0 0 20px rgba(200, 134, 10, 0.3);
    }
}

.coach-icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.coach-name {
    font-size: 14px;
    font-weight: 700;
    color: #C8860A;
    margin-bottom: 4px;
}

.coach-focus {
    font-size: 11px;
    color: rgba(200, 134, 10, 0.6);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.coach-desc {
    font-size: 12px;
    color: rgba(245, 240, 232, 0.6);
    line-height: 1.5;
    margin-bottom: 10px;
}

.coach-bonus {
    font-size: 11px;
    font-weight: 700;
    color: #22c55e;
    letter-spacing: 0.04em;
}

.budget-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(139, 94, 60, 0.3);
}

.budget-label {
    font-size: 12px;
    color: rgba(245, 240, 232, 0.5);
    letter-spacing: 0.06em;
}

.budget-amount {
    font-size: 20px;
    font-weight: 700;
    color: #22c55e;
    transition: color 0.3s;

    &.budget-over {
        color: #ef4444;
    }
}

.budget-total {
    font-size: 14px;
    color: rgba(245, 240, 232, 0.3);
}

.role-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.role-tab {
    padding: 6px 16px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(139, 94, 60, 0.3);
    color: rgba(245, 240, 232, 0.5);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;

    &:hover {
        border-color: #C8860A;
        color: #C8860A;
    }

    &--active {
        border-color: #C8860A;
        color: #C8860A;
        background: rgba(200, 134, 10, 0.1);
    }

    &--filled {
        border-color: rgba(34, 197, 94, 0.5);
    }
}

.role-filled-badge {
    color: #22c55e;
    margin-left: 4px;
    font-size: 10px;
}

.players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
}

.roster-summary {
    padding: 16px;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(139, 94, 60, 0.3);
}

.summary-title {
    font-size: 13px;
    font-weight: 700;
    color: #C8860A;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 10px;
}

.roster-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.roster-slot {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
}

.roster-role {
    width: 60px;
    color: rgba(245, 240, 232, 0.5);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.roster-player {
    flex: 1;
    font-weight: 700;
    color: #F5F0E8;

    &--empty {
        color: rgba(245, 240, 232, 0.2);
        font-style: italic;
        font-weight: 400;
    }
}

.roster-salary {
    font-size: 11px;
    color: #C8860A;
}
</style>
