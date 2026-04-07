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
                <button class="setup-btn" :disabled="!selectedCoach" @click="goToDraft">
                    PRÓXIMO
                </button>
            </div>
        </div>

        <!-- Step 3: Snake Draft -->
        <div v-if="step === 3" class="setup-section animate-float-up">
            <h2 class="section-title">DRAFT DE JOGADORES</h2>

            <!-- Progress -->
            <div class="draft-progress">
                <div class="draft-progress-bar">
                    <div class="draft-progress-fill" :style="{ width: `${(currentPickIdx / TOTAL_PICKS) * 100}%` }"></div>
                </div>
                <span class="draft-progress-text">PICK {{ currentPickIdx }}/{{ TOTAL_PICKS }}</span>
            </div>

            <!-- Status -->
            <div class="draft-status">
                <template v-if="!isDraftDone">
                    <div v-if="isAIPicking" class="draft-clock draft-clock--ai">
                        AGUARDANDO IA: {{ getTeamName(currentPickTeam) }}...
                    </div>
                    <div v-else class="draft-clock draft-clock--player">
                        SUA VEZ! ESCOLHA UM JOGADOR
                    </div>
                </template>
                <div v-if="lastAIPick" class="draft-last-pick">
                    ÚLTIMO PICK: <strong>{{ lastAIPick.player.nickname }}</strong> → {{ getTeamName(lastAIPick.team) }}
                </div>
            </div>

            <!-- Draft Board -->
            <div class="draft-board">
                <div
                    v-for="teamId in draftOrder"
                    :key="teamId"
                    class="draft-board-row"
                    :class="{ 'draft-board-row--active': !isDraftDone && currentPickTeam === teamId }"
                >
                    <div class="draft-team-name" :class="{ 'draft-team-name--player': teamId === 'player' }">
                        {{ getTeamName(teamId) }}
                    </div>
                    <div class="draft-team-picks">
                        <div
                            v-for="role in ROLES"
                            :key="role"
                            class="draft-pick-slot"
                            :class="{ 'draft-pick-slot--filled': getPickedPlayer(teamId, role) }"
                        >
                            <template v-if="getPickedPlayer(teamId, role)">
                                <span class="draft-pick-role-tag">{{ ROLE_SHORT_LABELS[role] }}</span>
                                <span class="draft-pick-name">{{ getPickedPlayer(teamId, role)?.nickname }}</span>
                            </template>
                            <template v-else>
                                <span class="draft-pick-empty">{{ ROLE_SHORT_LABELS[role] }}</span>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Player Pick Panel -->
            <template v-if="!isAIPicking && !isDraftDone">
                <div class="role-tabs">
                    <button
                        v-for="role in neededRoles"
                        :key="role"
                        class="role-tab"
                        :class="{ 'role-tab--active': draftRoleFilter === role }"
                        @click="draftRoleFilter = role"
                    >
                        {{ ROLE_LABELS[role] }}
                    </button>
                </div>

                <div class="players-grid">
                    <PlayerCard
                        v-for="player in availableForPlayer"
                        :key="player.id"
                        :player="player"
                        clickable
                        showPool
                        @click="playerPick(player)"
                    />
                </div>
            </template>

            <div class="setup-nav">
                <button class="setup-btn setup-btn--secondary" @click="step = 2">Voltar</button>
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
import { ALL_PLAYERS } from '@/data/players'
import { AI_TEAMS } from '@/data/teams'
import { ROLES, ROLE_LABELS, ROLE_SHORT_LABELS } from '@/types/game.types'
import type { Player, Coach, Role, AITeam } from '@/types/game.types'
import PlayerCard from '@/components/shared/PlayerCard.vue'

const router = useRouter()
const teamStore = useTeamStore()
const gameStore = useGameStore()
const tournamentStore = useTournamentStore()

const step = ref(1)
const teamName = ref(teamStore.teamName || '')
const selectedCoach = ref<Coach | null>(teamStore.coach)
const coaches = COACHES

// ── Constants ─────────────────────────────────────────────────────────────────

const TOTAL_PICKS = AI_TEAMS.length * ROLES.length  // 8 times × 5 roles = 40

// ── Draft state ───────────────────────────────────────────────────────────────

const draftPool = ref<Player[]>([])
const draftOrder = ref<string[]>([])
const selectedAITeams = ref<AITeam[]>([])
const teamPicks = ref<Record<string, Player[]>>({})
const currentPickIdx = ref(0)
const isAIPicking = ref(false)
const lastAIPick = ref<{ team: string; player: Player } | null>(null)
const draftRoleFilter = ref<Role>('top')

// ── Computed ──────────────────────────────────────────────────────────────────

const isDraftDone = computed(() => currentPickIdx.value >= TOTAL_PICKS)

const currentPickTeam = computed(() => {
    if (isDraftDone.value) return ''
    const n = draftOrder.value.length
    const round = Math.floor(currentPickIdx.value / n)
    const pos = currentPickIdx.value % n
    const idx = round % 2 === 0 ? pos : (n - 1 - pos)
    return draftOrder.value[idx] ?? ''
})

const neededRoles = computed(() => neededRolesFor('player'))

const availableForPlayer = computed(() =>
    draftPool.value.filter(p => p.role === draftRoleFilter.value)
)

// ── Helpers ───────────────────────────────────────────────────────────────────

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

function neededRolesFor(teamId: string): Role[] {
    const filled = new Set(teamPicks.value[teamId]?.map(p => p.role) ?? [])
    return ROLES.filter(r => !filled.has(r))
}

function getTeamName(teamId: string): string {
    if (teamId === 'player') return teamName.value || 'SEU TIME'
    return selectedAITeams.value.find(t => t.id === teamId)?.name ?? teamId
}

function getPickedPlayer(teamId: string, role: Role): Player | undefined {
    return teamPicks.value[teamId]?.find(p => p.role === role)
}

// ── Draft logic ───────────────────────────────────────────────────────────────

function initDraft() {
    const aiTeams = shuffle(AI_TEAMS).slice(0, 7)
    selectedAITeams.value = aiTeams

    const allIds = shuffle(['player', ...aiTeams.map(t => t.id)])
    draftOrder.value = allIds

    draftPool.value = [...ALL_PLAYERS]
    teamPicks.value = Object.fromEntries(allIds.map(id => [id, []]))
    currentPickIdx.value = 0
    isAIPicking.value = false
    lastAIPick.value = null
}

function getAIPick(teamId: string): Player {
    const aiTeam = AI_TEAMS.find(t => t.id === teamId)!
    const needed = shuffle(neededRolesFor(teamId))

    for (const role of needed) {
        const prefId = aiTeam.preferredPlayerIds.find(pid =>
            draftPool.value.some(p => p.id === pid && p.role === role)
        )
        if (prefId) return draftPool.value.find(p => p.id === prefId)!
    }

    return draftPool.value
        .filter(p => needed.includes(p.role as Role))
        .sort((a, b) =>
            (b.stats.farm + b.stats.mechanics + b.stats.teamfight) -
            (a.stats.farm + a.stats.mechanics + a.stats.teamfight)
        )[0]
}

function makePick(player: Player) {
    teamPicks.value[currentPickTeam.value].push(player)
    draftPool.value = draftPool.value.filter(p => p.id !== player.id)
    currentPickIdx.value++
}

async function advanceAIPicks() {
    if (isAIPicking.value) return
    isAIPicking.value = true

    while (!isDraftDone.value && currentPickTeam.value !== 'player') {
        await new Promise(r => setTimeout(r, 600))
        const team = currentPickTeam.value
        const pick = getAIPick(team)
        lastAIPick.value = { team, player: pick }
        makePick(pick)
    }

    isAIPicking.value = false

    if (isDraftDone.value) {
        finalizeDraft()
    } else {
        draftRoleFilter.value = neededRoles.value[0] ?? 'top'
    }
}

function playerPick(player: Player) {
    if (isAIPicking.value || !neededRoles.value.includes(player.role as Role)) return
    makePick(player)
    advanceAIPicks()
}

function finalizeDraft() {
    for (const aiTeam of selectedAITeams.value) {
        AI_TEAMS.find(t => t.id === aiTeam.id)!.roster = teamPicks.value[aiTeam.id]
    }

    teamStore.setTeamName(teamName.value)
    if (selectedCoach.value) teamStore.selectCoach(selectedCoach.value)
    for (const player of teamPicks.value['player'] ?? []) {
        teamStore.addPlayer(player)
    }

    tournamentStore.initTournament('player', selectedAITeams.value.map(t => t.id))
    tournamentStore.simulateAIMatches()
    gameStore.setPhase('tournament')
    router.push('/tournament')
}

function goToDraft() {
    initDraft()
    step.value = 3
    advanceAIPicks()
}
</script>

<style lang="scss" scoped>
.setup-view {
    min-height: 100vh;
    background: #1a0d06;
    padding: 20px;
    max-width: 960px;
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

// ── Draft styles ──────────────────────────────────────────────────────────────

.draft-progress {
    display: flex;
    align-items: center;
    gap: 12px;
}

.draft-progress-bar {
    flex: 1;
    height: 6px;
    background: rgba(139, 94, 60, 0.2);
    border-radius: 3px;
    overflow: hidden;
}

.draft-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #C8860A, #e8a020);
    border-radius: 3px;
    transition: width 0.4s ease;
}

.draft-progress-text {
    font-size: 12px;
    font-weight: 700;
    color: rgba(245, 240, 232, 0.5);
    letter-spacing: 0.08em;
    white-space: nowrap;
}

.draft-status {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 48px;
}

.draft-clock {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 8px 14px;
    border-left: 3px solid;

    &--player {
        color: #C8860A;
        border-color: #C8860A;
        background: rgba(200, 134, 10, 0.08);
    }

    &--ai {
        color: rgba(245, 240, 232, 0.5);
        border-color: rgba(139, 94, 60, 0.5);
        background: rgba(0, 0, 0, 0.2);
    }
}

.draft-last-pick {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.4);
    letter-spacing: 0.06em;
    padding-left: 14px;

    strong {
        color: rgba(245, 240, 232, 0.7);
    }
}

.draft-board {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(139, 94, 60, 0.2);
    padding: 8px;
}

.draft-board-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border: 1px solid transparent;
    transition: all 0.2s;

    &--active {
        border-color: rgba(200, 134, 10, 0.4);
        background: rgba(200, 134, 10, 0.06);
    }
}

.draft-team-name {
    width: 160px;
    font-size: 11px;
    font-weight: 700;
    color: rgba(245, 240, 232, 0.5);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;

    &--player {
        color: #C8860A;
    }
}

.draft-team-picks {
    display: flex;
    gap: 4px;
    flex: 1;
}

.draft-pick-slot {
    flex: 1;
    min-width: 0;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(139, 94, 60, 0.2);
    padding: 4px 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;

    &--filled {
        border-color: rgba(139, 94, 60, 0.4);
        background: rgba(42, 21, 8, 0.8);
    }
}

.draft-pick-role-tag {
    font-size: 9px;
    font-weight: 700;
    color: rgba(200, 134, 10, 0.7);
    letter-spacing: 0.06em;
}

.draft-pick-name {
    font-size: 10px;
    font-weight: 700;
    color: #F5F0E8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.draft-pick-empty {
    font-size: 10px;
    color: rgba(139, 94, 60, 0.35);
    letter-spacing: 0.06em;
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

    &:hover {
        border-color: #C8860A;
        color: #C8860A;
    }

    &--active {
        border-color: #C8860A;
        color: #C8860A;
        background: rgba(200, 134, 10, 0.1);
    }
}

.players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    max-height: 360px;
    overflow-y: auto;
}
</style>
