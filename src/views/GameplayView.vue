<template>
    <div class="gameplay-view">
        <div class="gameplay-header">
            <div class="gp-team-info gp-team-info--player">
                <p class="gp-team-name">{{ teamStore.teamName }}</p>
                <p class="gp-team-role">SEU TIME</p>
            </div>
            <div class="gp-series-score">
                <p class="series-label">{{ matchFormat?.toUpperCase() }}</p>
                <div class="score-display">
                    <span class="score-num" :class="{ 'score-leading': gameStore.seriesScores.player > gameStore.seriesScores.opponent }">
                        {{ gameStore.seriesScores.player }}
                    </span>
                    <span class="score-dash">-</span>
                    <span class="score-num" :class="{ 'score-leading': gameStore.seriesScores.opponent > gameStore.seriesScores.player }">
                        {{ gameStore.seriesScores.opponent }}
                    </span>
                </div>
                <p class="game-num">JOGO {{ gameStore.currentGameInSeries }}</p>
            </div>
            <div class="gp-team-info gp-team-info--opponent">
                <p class="gp-team-name">{{ opponentName }}</p>
                <p class="gp-team-role">ADVERSÁRIO</p>
            </div>
        </div>

        <div class="gameplay-grid">
            <!-- Game Log -->
            <div class="gameplay-log-section">
                <div class="game-status" v-if="gameResult && eventIndex >= gameResult.events.length">
                    <div class="result-banner" :class="gameResult.winner === 'player' ? 'result-banner--win' : 'result-banner--loss'">
                        <p class="result-text">
                            {{ gameResult.winner === 'player' ? 'VITÓRIA!' : 'DERROTA' }}
                        </p>
                    </div>
                </div>

                <GameLog
                    v-if="gameResult"
                    :events="gameResult.events"
                    :currentIndex="eventIndex"
                />
            </div>

            <!-- Stats & Picks -->
            <div class="gameplay-side">
                <!-- Draft Picks Display -->
                <div class="picks-display">
                    <h3 class="picks-title">Draft</h3>
                    <div class="picks-row">
                        <div class="picks-side">
                            <p class="picks-side-label">{{ playerSide === 'blue' ? 'Azul' : 'Vermelho' }}</p>
                            <div class="pick-champs">
                                <div v-for="champ in playerPicks" :key="champ" class="pick-champ">
                                    <img :src="`/champions/${champ}.png`" :alt="champ" class="pick-champ-img" @error="onIconError" />
                                    <span class="pick-champ-name">{{ champ }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="picks-side picks-side--opponent">
                            <p class="picks-side-label">{{ playerSide === 'blue' ? 'Vermelho' : 'Azul' }}</p>
                            <div class="pick-champs">
                                <div v-for="champ in opponentPicks" :key="champ" class="pick-champ">
                                    <img :src="`/champions/${champ}.png`" :alt="champ" class="pick-champ-img" @error="onIconError" />
                                    <span class="pick-champ-name">{{ champ }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div v-if="gameResult && eventIndex >= gameResult.events.length" class="game-stats">
                    <h3 class="stats-title">Estatísticas</h3>
                    <div class="stats-grid">
                        <div class="stat-col">
                            <p class="stat-col-label">{{ teamStore.teamName }}</p>
                            <p class="stat-item">{{ gameResult.stats.player.kills }}K / {{ gameResult.stats.player.deaths }}D</p>
                            <p class="stat-item">Ouro: {{ (gameResult.stats.player.gold / 1000).toFixed(1) }}k</p>
                            <p class="stat-item">Torres: {{ gameResult.stats.player.towers }}</p>
                        </div>
                        <div class="stat-col stat-col--opponent">
                            <p class="stat-col-label">{{ opponentName }}</p>
                            <p class="stat-item">{{ gameResult.stats.opponent.kills }}K / {{ gameResult.stats.opponent.deaths }}D</p>
                            <p class="stat-item">Ouro: {{ (gameResult.stats.opponent.gold / 1000).toFixed(1) }}k</p>
                            <p class="stat-item">Torres: {{ gameResult.stats.opponent.towers }}</p>
                        </div>
                    </div>
                </div>

                <!-- Post-game actions -->
                <div v-if="gameResult && eventIndex >= gameResult.events.length" class="postgame-actions">
                    <div class="morale-update">
                        <p v-if="gameResult.winner === 'player'" class="morale-pos">
                            +10 Moral para todos os jogadores
                        </p>
                        <p v-else class="morale-neg">
                            -15 Moral para todos os jogadores
                        </p>
                    </div>

                    <template v-if="seriesFinished">
                        <p class="series-result" :class="playerWonSeries ? 'text-green-400' : 'text-red-400'">
                            {{ playerWonSeries ? 'SÉRIE VENCIDA!' : 'SÉRIE PERDIDA' }}
                        </p>
                        <button class="postgame-btn" @click="goToTournament">
                            VER BRACKET
                        </button>
                    </template>
                    <template v-else>
                        <p class="next-game-info">
                            Próximo jogo: {{ gameStore.seriesScores.player }} - {{ gameStore.seriesScores.opponent }}
                        </p>
                        <button class="postgame-btn" @click="nextGame">
                            PRÓXIMO JOGO
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/team'
import { useGameStore } from '@/stores/game'
import { useTournamentStore } from '@/stores/tournament'
import { useChampionsStore } from '@/stores/champions'
import { simulateGame } from '@/engine/simulation'
import { getAITeamById, getAITeamPicks } from '@/engine/ai-team'
import { ROLES } from '@/types/game.types'
import type { GameResult } from '@/types/game.types'
import { onIconError } from '@/utils/championImages'
import GameLog from '@/components/gameplay/GameLog.vue'

const router = useRouter()
const teamStore = useTeamStore()
const gameStore = useGameStore()
const tournamentStore = useTournamentStore()
const champStore = useChampionsStore()

const gameResult = ref<GameResult | null>(null)
const eventIndex = ref(0)

const playerSide = computed(() => gameStore.currentGameInSeries % 2 === 1 ? 'blue' : 'red')
const aiSide = computed(() => playerSide.value === 'blue' ? 'red' : 'blue')

const currentMatch = computed(() => tournamentStore.currentMatch)
const opponentTeamId = computed(() => {
    if (!currentMatch.value) return null
    return currentMatch.value.teamA === 'player' ? currentMatch.value.teamB : currentMatch.value.teamA
})
const opponentTeam = computed(() => opponentTeamId.value ? getAITeamById(opponentTeamId.value) : null)
const opponentName = computed(() => opponentTeam.value?.name ?? 'Adversário')
const matchFormat = computed(() => currentMatch.value?.format ?? 'bo3')

const playerPicks = computed(() => champStore.picks[playerSide.value].map(p => p.name))
const opponentPicks = computed(() => champStore.picks[aiSide.value].map(p => p.name))

function picksToMap(picks: string[]): Record<string, string> {
    const map: Record<string, string> = {}
    ROLES.forEach((role, i) => { if (picks[i]) map[role] = picks[i] })
    return map
}

const playerPicksMap   = computed(() => picksToMap(playerPicks.value))
const opponentPicksMap = computed(() => picksToMap(opponentPicks.value))

const seriesFinished  = computed(() => gameStore.isSeriesOver(matchFormat.value))
const playerWonSeries = computed(() => gameStore.playerWonSeries(matchFormat.value))

const applyMoraleChanges = (winner: 'player' | 'opponent') => {
    for (const player of teamStore.roster) {
        const updated = { ...player }
        updated.fatigue = Math.min(100, updated.fatigue + 5)
        if (winner === 'player') {
            updated.moral = Math.min(100, updated.moral + 10)
        } else {
            updated.moral = Math.max(0, updated.moral - 15)
        }
        teamStore.updateRosterPlayer(updated)
    }
}

const runSimulation = () => {
    const aiRoster = opponentTeam.value?.roster ?? []
    const result = simulateGame(
        teamStore.roster,
        aiRoster,
        playerPicksMap.value,
        opponentPicksMap.value,
        teamStore.coach
    )
    gameResult.value = result
    gameStore.recordGameResult(result.winner)
    applyMoraleChanges(result.winner)

    // Play events one by one
    let idx = 0
    const interval = setInterval(() => {
        if (idx < result.events.length) {
            idx++
            eventIndex.value = idx
        } else {
            clearInterval(interval)
        }
    }, 1800)
}

const nextGame = () => {
    gameStore.currentGameInSeries++
    gameStore.setPhase('champselect')
    champStore.resetDraft()
    router.push('/champselect')
}

const goToTournament = () => {
    // Record match result in tournament
    if (currentMatch.value) {
        const winner = playerWonSeries.value ? 'player' : (opponentTeamId.value ?? '')
        tournamentStore.recordMatchResult(currentMatch.value.id, winner)
        tournamentStore.simulateAIMatches()

        if (tournamentStore.isPlayerEliminated) {
            gameStore.setPhase('gameover')
            router.push('/gameover')
            return
        }

        if (tournamentStore.hasPlayerWon) {
            gameStore.setPhase('victory')
            router.push('/gameover')
            return
        }

        // Find next player match
        const nextMatch = tournamentStore.playerNextMatch
        if (nextMatch) {
            tournamentStore.setCurrentMatch(nextMatch.id)
        }
    }

    gameStore.setPhase('tournament')
    router.push('/tournament')
}

onMounted(() => {
    runSimulation()
})
</script>

<style lang="scss" scoped>
.gameplay-view {
    min-height: 100vh;
    background: #1a0d06;
    padding: 20px;
    max-width: 1100px;
    margin: 0 auto;
}

.gameplay-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 16px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(139, 94, 60, 0.3);
}

.gp-team-info {
    text-align: center;

    &--opponent {
        text-align: center;
    }
}

.gp-team-name {
    font-size: 16px;
    font-weight: 700;
    color: #C8860A;
    letter-spacing: 0.08em;
}

.gp-team-role {
    font-size: 10px;
    color: rgba(245, 240, 232, 0.3);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 2px;
}

.gp-series-score {
    text-align: center;
}

.series-label {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.4);
    letter-spacing: 0.12em;
    margin-bottom: 4px;
}

.score-display {
    display: flex;
    align-items: center;
    gap: 12px;
}

.score-num {
    font-size: 32px;
    font-weight: 900;
    color: rgba(245, 240, 232, 0.3);
    transition: color 0.3s;

    &.score-leading {
        color: #C8860A;
    }
}

.score-dash {
    font-size: 20px;
    color: rgba(245, 240, 232, 0.3);
}

.game-num {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.3);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 2px;
}

.gameplay-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 20px;
}

.gameplay-log-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.game-status {
    text-align: center;
}

.result-banner {
    padding: 16px;
    border-radius: 2px;

    &--win {
        background: rgba(34, 197, 94, 0.15);
        border: 1px solid rgba(34, 197, 94, 0.4);
    }

    &--loss {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.4);
    }
}

.result-text {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: #F5F0E8;
}

.gameplay-side {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.picks-display {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(139, 94, 60, 0.3);
    padding: 12px;
}

.picks-title {
    font-size: 12px;
    font-weight: 700;
    color: rgba(200, 134, 10, 0.7);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 10px;
}

.picks-row {
    display: flex;
    gap: 16px;
}

.picks-side {
    flex: 1;

    &--opponent {
        text-align: right;
    }
}

.picks-side-label {
    font-size: 10px;
    color: rgba(245, 240, 232, 0.4);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
}

.pick-champs {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.pick-champ {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: rgba(245, 240, 232, 0.7);

    .picks-side--opponent & {
        flex-direction: row-reverse;
    }
}

.pick-champ-img {
    width: 24px;
    height: 24px;
    border-radius: 2px;
    object-fit: cover;
}

.pick-champ-name {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.6);
}

.game-stats {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(139, 94, 60, 0.3);
    padding: 12px;
}

.stats-title {
    font-size: 12px;
    font-weight: 700;
    color: rgba(200, 134, 10, 0.7);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 10px;
}

.stats-grid {
    display: flex;
    justify-content: space-between;
    gap: 16px;
}

.stat-col {
    flex: 1;

    &--opponent {
        text-align: right;
    }
}

.stat-col-label {
    font-size: 12px;
    font-weight: 700;
    color: #C8860A;
    margin-bottom: 6px;
    letter-spacing: 0.05em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.stat-item {
    font-size: 12px;
    color: rgba(245, 240, 232, 0.6);
    margin-bottom: 3px;
}

.postgame-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(139, 94, 60, 0.3);
}

.morale-update {
    text-align: center;
}

.morale-pos {
    font-size: 12px;
    color: #22c55e;
    letter-spacing: 0.04em;
}

.morale-neg {
    font-size: 12px;
    color: #ef4444;
    letter-spacing: 0.04em;
}

.series-result {
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.1em;
}

.next-game-info {
    text-align: center;
    font-size: 12px;
    color: rgba(245, 240, 232, 0.4);
    letter-spacing: 0.06em;
}

.postgame-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(180deg, #C8860A 0%, #8B5E3C 100%);
    border: none;
    color: #1a0d06;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px);

    &:hover {
        background: linear-gradient(180deg, #e8a020 0%, #C8860A 100%);
        box-shadow: 0 0 16px rgba(200, 134, 10, 0.4);
    }
}
</style>
