<template>
    <div class="relative w-full select-none">
        <Background style="z-index: -1" :phase="currentPhase" :champion="hoveredChampion" />

        <div class="flex w-full text-gray-200 min-h-screen z-50">
            <!-- Blue Side -->
            <div id="blue-side" class="w-1/4 flex flex-col">
                <div class="side-header side-header--blue">
                    <p class="side-team-name">{{ playerSide === 'blue' ? teamStore.teamName : opponentName }}</p>
                </div>
                <div class="w-full px-5 mb-5">
                    <Bans side="blue" :bans="champStore.bans.blue" />
                </div>
                <div class="flex flex-col justify-center flex-1">
                    <TeamPicks
                        side="blue"
                        :champions="champStore.picks.blue"
                        position="left"
                        :hoveredChampion="blueTurnHovered"
                        :isActiveTurn="currentTurnSide === 'blue' && currentPhase === 'pick'"
                        :playerNames="playerSide === 'blue' ? playerNames : opponentPlayerNames"
                    />
                </div>
            </div>

            <!-- Center Champion Grid -->
            <div id="champion-list" class="w-1/2 flex flex-col">
                <div class="cs-header">
                    <div class="cs-match-info">
                        <span class="cs-game-label">Jogo {{ gameStore.currentGameInSeries }}</span>
                        <span class="cs-score">
                            {{ gameStore.seriesScores.player }} - {{ gameStore.seriesScores.opponent }}
                        </span>
                        <span class="cs-format">{{ currentMatchFormat?.toUpperCase() }}</span>
                    </div>
                    <p class="cs-header__title">
                        <template v-if="champStore.isDraftComplete">DRAFT COMPLETO!</template>
                        <template v-else-if="isPlayerTurn">
                            {{ currentPhase === 'ban' ? 'BANA UM CAMPEÃO!' : 'ESCOLHA SEU CAMPEÃO!' }}
                        </template>
                        <template v-else>
                            {{ currentPhase === 'ban' ? 'ADVERSÁRIO ESTÁ BANINDO...' : 'ADVERSÁRIO ESTÁ ESCOLHENDO...' }}
                        </template>
                    </p>
                    <div class="cs-timer" v-if="!champStore.isDraftComplete">
                        <div class="cs-timer__bar-track">
                            <div class="cs-timer__bar-fill" :style="{ width: `${timerProgress * 100}%`, background: timerBarColor }" />
                        </div>
                        <span class="cs-timer__number" :style="{ color: timerNumberColor }">{{ timeLeft }}</span>
                    </div>
                </div>

                <div v-if="!champStore.isDraftComplete" class="flex flex-col justify-center flex-1">
                    <GridHeader @queryUpdated="champStore.setFilter" @roleUpdated="champStore.setRoleFilter" />
                    <div class="w-full text-center overflow-hidden">
                        <ChampionsGrid
                            v-model:hoveredChampion="hoveredChampion"
                            :champions="champStore.filteredChampions"
                            :unavailableChampions="champStore.unavailableChampions"
                            :bannedChampions="champStore.bannedChampions"
                            :phase="currentPhase"
                            :showKnowledge="isPlayerTurn"
                            :knowledgeMap="playerKnowledgeMap"
                            :interactive="isPlayerTurn"
                            @confirmedChamp="handleConfirm"
                        />
                    </div>
                </div>

                <div v-else class="draft-complete-center">
                    <p class="draft-complete-text">Draft finalizado!</p>
                    <button class="start-game-btn" @click="startGame">
                        INICIAR PARTIDA
                    </button>
                </div>
            </div>

            <!-- Red Side -->
            <div id="red-side" class="w-1/4 flex flex-col">
                <div class="side-header side-header--red">
                    <p class="side-team-name">{{ playerSide === 'red' ? teamStore.teamName : opponentName }}</p>
                </div>
                <div class="w-full px-5 mb-5">
                    <Bans side="red" :bans="champStore.bans.red" />
                </div>
                <div class="flex flex-col justify-center flex-1">
                    <TeamPicks
                        side="red"
                        :champions="champStore.picks.red"
                        position="right"
                        :hoveredChampion="redTurnHovered"
                        :isActiveTurn="currentTurnSide === 'red' && currentPhase === 'pick'"
                        :playerNames="playerSide === 'red' ? playerNames : opponentPlayerNames"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useChampionsStore } from '@/stores/champions'
import { useTeamStore } from '@/stores/team'
import { useGameStore } from '@/stores/game'
import { useTournamentStore } from '@/stores/tournament'
import { useTimer } from '@/composables/useTimer'
import { getAIBans, getAIPick, getRandomAIBan } from '@/engine/ai-draft'
import { getAITeamById } from '@/engine/ai-team'
import { AI_TEAMS } from '@/data/teams'

import Bans from '@/components/champion-select/Bans.vue'
import ChampionsGrid from '@/components/champion-select/ChampionsGrid.vue'
import GridHeader from '@/components/champion-select/GridHeader.vue'
import TeamPicks from '@/components/champion-select/TeamPicks.vue'
import Background from '@/components/champion-select/Background.vue'

const router = useRouter()
const champStore = useChampionsStore()
const teamStore = useTeamStore()
const gameStore = useGameStore()
const tournamentStore = useTournamentStore()

const TURN_DURATION = 30
const SLOT_ROLES = ['Top', 'Jungle', 'Mid', 'Bottom', 'Support']

// Determine player side: blue for odd games, red for even
const playerSide = computed(() => gameStore.currentGameInSeries % 2 === 1 ? 'blue' : 'red')
const aiSide = computed(() => playerSide.value === 'blue' ? 'red' : 'blue')

// Get opponent
const currentMatch = computed(() => tournamentStore.currentMatch)
const opponentTeamId = computed(() => {
    if (!currentMatch.value) return null
    return currentMatch.value.teamA === 'player' ? currentMatch.value.teamB : currentMatch.value.teamA
})
const opponentTeam = computed(() => opponentTeamId.value ? getAITeamById(opponentTeamId.value) : null)
const opponentName = computed(() => opponentTeam.value?.name ?? 'Adversário')

const currentMatchFormat = computed(() => currentMatch.value?.format ?? 'bo3')

const hoveredChampion = ref<string>('')
const currentPhase = computed(() => champStore.currentTurn?.phase ?? 'ban')
const currentTurnSide = computed(() => champStore.currentTurn?.side ?? 'blue')
const isPlayerTurn = computed(() => champStore.isPlayerTurn)

const blueTurnHovered = computed(() => currentTurnSide.value === 'blue' && currentPhase.value === 'pick' ? hoveredChampion.value : '')
const redTurnHovered = computed(() => currentTurnSide.value === 'red' && currentPhase.value === 'pick' ? hoveredChampion.value : '')

// Player knowledge map for the grid
const playerKnowledgeMap = computed(() => {
    const map: Record<string, number> = {}
    for (const player of teamStore.roster) {
        for (const champ of player.champPool) {
            const existing = map[champ.championId] ?? 0
            map[champ.championId] = Math.max(existing, champ.knowledge)
        }
    }
    return map
})

const playerNames = computed(() => teamStore.roster.map(p => p.nickname))
const opponentPlayerNames = computed(() => {
    if (!opponentTeam.value) return ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
    return opponentTeam.value.roster.map(p => p.nickname)
})

const { timeLeft, progress: timerProgress, start: startTimer } = useTimer(TURN_DURATION)

const timerBarColor = computed(() => {
    if (timerProgress.value > 0.5) return 'linear-gradient(90deg, #C8860A, #8B5E3C)'
    if (timerProgress.value > 0.25) return 'linear-gradient(90deg, #e6a817, #c8831e)'
    return 'linear-gradient(90deg, #c83232, #8b1a1a)'
})

const timerNumberColor = computed(() => {
    if (timerProgress.value > 0.5) return '#C8860A'
    if (timerProgress.value > 0.25) return '#e6a817'
    return '#c83232'
})

// Pre-compute AI bans
let aiBanQueue: string[] = []

const setupAI = () => {
    if (!opponentTeam.value) return
    aiBanQueue = getAIBans(
        teamStore.roster,
        champStore.unavailableChampions,
        5
    )
}

const performAIAction = () => {
    if (champStore.isDraftComplete) return
    const step = champStore.currentTurn
    if (!step) return
    if (step.side !== aiSide.value) return

    const unavailable = champStore.unavailableChampions

    if (step.phase === 'ban') {
        let ban = aiBanQueue.find(b => !unavailable.some(u => u.toLowerCase() === b.toLowerCase()))
        if (!ban) ban = getRandomAIBan(unavailable, champStore.champions)
        if (ban) {
            setTimeout(() => {
                champStore.confirmChampion(ban!)
            }, 1200)
        }
    } else {
        // Pick phase
        const slotIndex = champStore.picks[aiSide.value].length
        const aiRoster = opponentTeam.value?.roster ?? []
        const pick = getAIPick(aiRoster, slotIndex, unavailable, champStore.champions)
        setTimeout(() => {
            champStore.confirmChampion(pick)
        }, 1200)
    }
}

const autoConfirmPlayer = () => {
    if (champStore.isDraftComplete) return
    const unavailable = new Set(champStore.unavailableChampions.map(n => n.toLowerCase()))
    let pool = champStore.champions.filter(c => !unavailable.has(c.id.toLowerCase()))

    if (currentPhase.value === 'pick') {
        const slotIndex = champStore.picks[playerSide.value].length
        const role = SLOT_ROLES[slotIndex] ?? 'Top'
        const rolePool = pool.filter(c => {
            const positions = (window as any).__CHAMPION_POSITIONS?.[c.name] ?? []
            return positions.includes(role)
        })
        if (rolePool.length > 0) pool = rolePool
    }

    if (pool.length === 0) return
    handleConfirm(pool[Math.floor(Math.random() * pool.length)].id)
}

watch(() => champStore.draftStep, (newStep) => {
    if (champStore.isDraftComplete) return
    startTimer()
    hoveredChampion.value = ''

    const step = champStore.currentTurn
    if (step && step.side === aiSide.value) {
        performAIAction()
    }
}, { immediate: false })

watch(timeLeft, (val) => {
    if (val === 0) {
        if (isPlayerTurn.value) {
            autoConfirmPlayer()
        }
    }
})

const handleConfirm = (champ: string): void => {
    if (!isPlayerTurn.value) return
    champStore.confirmChampion(champ)
    hoveredChampion.value = ''
}

const startGame = () => {
    gameStore.setPhase('gameplay')
    router.push('/gameplay')
}

onMounted(async () => {
    champStore.setPlayerSide(playerSide.value)
    champStore.resetDraft()

    if (champStore.champions.length === 0) {
        await champStore.getChampionList()
    }

    setupAI()
    startTimer()

    // If it's AI's turn first
    const firstStep = champStore.currentTurn
    if (firstStep && firstStep.side === aiSide.value) {
        performAIAction()
    }
})
</script>

<style lang="scss">
.side-header {
    padding: 8px 16px;
    text-align: center;

    &--blue {
        border-bottom: 1px solid rgba(200, 134, 10, 0.3);
        background: linear-gradient(to bottom, rgba(200, 134, 10, 0.08), transparent);
    }

    &--red {
        border-bottom: 1px solid rgba(239, 68, 68, 0.3);
        background: linear-gradient(to bottom, rgba(239, 68, 68, 0.05), transparent);
    }
}

.side-team-name {
    font-size: 13px;
    font-weight: 700;
    color: #C8860A;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.cs-header {
    text-align: center;
    padding: 12px 0 8px;
}

.cs-match-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
    font-size: 11px;
    letter-spacing: 0.08em;
}

.cs-game-label {
    color: rgba(245, 240, 232, 0.4);
}

.cs-score {
    font-size: 16px;
    font-weight: 700;
    color: #C8860A;
}

.cs-format {
    color: rgba(200, 134, 10, 0.5);
}

.cs-header__title {
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #C8860A;
    text-shadow: 0 0 20px rgba(200, 134, 10, 0.5), 0 0 40px rgba(200, 134, 10, 0.2);
    margin-bottom: 8px;
}

.cs-timer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.cs-timer__bar-track {
    width: 220px;
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
}

.cs-timer__bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.9s linear, background 0.5s ease;
}

.cs-timer__number {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    line-height: 1;
    transition: color 0.5s ease;
    text-shadow: 0 0 16px currentColor;
}

.draft-complete-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
}

.draft-complete-text {
    font-size: 20px;
    color: #22c55e;
    font-weight: 700;
    letter-spacing: 0.1em;
}

.start-game-btn {
    padding: 14px 40px;
    background: linear-gradient(180deg, #C8860A 0%, #8B5E3C 100%);
    border: none;
    color: #1a0d06;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px);

    &:hover {
        background: linear-gradient(180deg, #e8a020 0%, #C8860A 100%);
        box-shadow: 0 0 24px rgba(200, 134, 10, 0.5);
    }
}
</style>
