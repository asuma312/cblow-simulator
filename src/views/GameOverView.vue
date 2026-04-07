<template>
    <div class="gameover-view" :class="isVictory ? 'gameover-view--victory' : 'gameover-view--defeat'">
        <div class="gameover-bg"></div>

        <div class="gameover-content">
            <div class="gameover-mascot">{{ isVictory ? 'CAMPEAO' : 'ELIMINADO' }}</div>

            <h1 class="gameover-title" :class="isVictory ? 'title--victory' : 'title--defeat'">
                {{ isVictory ? 'CAMPEÃO!' : 'GAME OVER' }}
            </h1>

            <p class="gameover-subtitle">
                {{ isVictory
                    ? 'Você conquistou o CBlow Championship 2026! O low elo nunca mais será o mesmo.'
                    : 'Seu time foi eliminado do torneio. A jornada termina aqui... por enquanto.'
                }}
            </p>

            <div class="gameover-divider">
                <div class="gd-line" />
                <div class="gd-diamond" />
                <div class="gd-line" />
            </div>

            <!-- Team Summary -->
            <div class="team-summary">
                <h2 class="summary-title">{{ teamStore.teamName }}</h2>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <p class="stat-label">Semanas</p>
                        <p class="stat-value">{{ gameStore.week }}</p>
                    </div>
                    <div class="summary-stat">
                        <p class="stat-label">Orçamento Final</p>
                        <p class="stat-value">R$ {{ teamStore.budget.toLocaleString('pt-BR') }}</p>
                    </div>
                    <div class="summary-stat">
                        <p class="stat-label">Coach</p>
                        <p class="stat-value">{{ teamStore.coach?.name ?? '---' }}</p>
                    </div>
                </div>

                <!-- Roster at end -->
                <div class="final-roster">
                    <h3 class="roster-title">Roster Final</h3>
                    <div class="roster-players">
                        <div v-for="player in teamStore.roster" :key="player.id" class="final-player">
                            <span class="fp-nickname">{{ player.nickname }}</span>
                            <span class="fp-role">{{ player.role.toUpperCase() }}</span>
                            <span class="fp-stats">
                                F:{{ player.stats.farm.toFixed(1) }} M:{{ player.stats.mechanics.toFixed(1) }} T:{{ player.stats.teamfight.toFixed(1) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tournament path -->
            <div class="tournament-path">
                <h3 class="path-title">Caminho no Torneio</h3>
                <div class="path-matches">
                    <div
                        v-for="match in playerMatches"
                        :key="match.id"
                        class="path-match"
                        :class="match.winner === 'player' ? 'path-match--win' : 'path-match--loss'"
                    >
                        <span class="pm-result">{{ match.winner === 'player' ? 'W' : 'L' }}</span>
                        <span class="pm-vs">vs {{ getOpponentName(match) }}</span>
                        <span class="pm-format">{{ match.format.toUpperCase() }}</span>
                    </div>
                </div>
            </div>

            <div class="gameover-actions">
                <button class="go-btn go-btn--restart" @click="restart">
                    JOGAR NOVAMENTE
                </button>
                <button class="go-btn go-btn--home" @click="goHome">
                    MENU PRINCIPAL
                </button>
            </div>

            <p class="gameover-flavor">
                {{ isVictory
                    ? '"Quem disse que bronze é ruim?" — Você, provavelmente'
                    : '"A próxima temporada vai ser diferente." — Todo bronze ever'
                }}
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useTeamStore } from '@/stores/team'
import { useTournamentStore } from '@/stores/tournament'
import { useChampionsStore } from '@/stores/champions'
import { AI_TEAMS } from '@/data/teams'
import type { Match } from '@/types/game.types'

const router = useRouter()
const gameStore = useGameStore()
const teamStore = useTeamStore()
const tournamentStore = useTournamentStore()
const champStore = useChampionsStore()

const isVictory = computed(() => gameStore.phase === 'victory')

const playerMatches = computed(() =>
    tournamentStore.matches.filter(
        m => m.winner && (m.teamA === 'player' || m.teamB === 'player')
    )
)

const getOpponentName = (match: Match): string => {
    const oppId = match.teamA === 'player' ? match.teamB : match.teamA
    if (oppId === 'TBD') return '???'
    return AI_TEAMS.find(t => t.id === oppId)?.name ?? oppId
}

const restart = () => {
    gameStore.reset()
    teamStore.resetTeam()
    tournamentStore.reset()
    champStore.resetDraft()
    router.push('/setup')
}

const goHome = () => {
    router.push('/')
}
</script>

<style lang="scss" scoped>
.gameover-view {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.gameover-view--victory {
    background: #0d0700;
}

.gameover-view--defeat {
    background: #070007;
}

.gameover-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.gameover-view--victory .gameover-bg {
    background: radial-gradient(ellipse at 50% 20%, rgba(200, 134, 10, 0.2) 0%, transparent 60%);
}

.gameover-view--defeat .gameover-bg {
    background: radial-gradient(ellipse at 50% 20%, rgba(100, 0, 0, 0.3) 0%, transparent 60%);
}

.gameover-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 40px 20px;
    max-width: 700px;
    width: 100%;
}

.gameover-mascot {
    font-size: 80px;
    margin-bottom: 12px;
    animation: pulse-gentle 2s ease-in-out infinite;
}

@keyframes pulse-gentle {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.gameover-title {
    font-size: 72px;
    font-weight: 900;
    letter-spacing: 0.12em;
    margin: 0 0 12px;
}

.title--victory {
    color: transparent;
    background: linear-gradient(180deg, #ffd700 0%, #C8860A 50%, #8B5E3C 100%);
    -webkit-background-clip: text;
    background-clip: text;
    filter: drop-shadow(0 0 30px rgba(200, 134, 10, 0.5));
}

.title--defeat {
    color: transparent;
    background: linear-gradient(180deg, #ef4444 0%, #991b1b 100%);
    -webkit-background-clip: text;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.4));
}

.gameover-subtitle {
    font-size: 14px;
    color: rgba(245, 240, 232, 0.5);
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto 20px;
    letter-spacing: 0.04em;
}

.gameover-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px auto;
    max-width: 400px;
}

.gd-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200, 134, 10, 0.4), transparent);
}

.gd-diamond {
    width: 8px;
    height: 8px;
    border: 1px solid #C8860A;
    transform: rotate(45deg);
}

.team-summary {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(139, 94, 60, 0.3);
    padding: 20px;
    margin-bottom: 16px;
    text-align: left;
}

.summary-title {
    font-size: 20px;
    font-weight: 700;
    color: #C8860A;
    letter-spacing: 0.08em;
    margin-bottom: 14px;
    text-align: center;
}

.summary-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(139, 94, 60, 0.2);
}

.summary-stat {
    text-align: center;
}

.stat-label {
    font-size: 10px;
    color: rgba(245, 240, 232, 0.4);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 4px;
}

.stat-value {
    font-size: 16px;
    font-weight: 700;
    color: #C8860A;
}

.final-roster {
    margin-top: 12px;
}

.roster-title {
    font-size: 12px;
    font-weight: 700;
    color: rgba(200, 134, 10, 0.6);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.roster-players {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.final-player {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    padding: 4px 8px;
    background: rgba(0,0,0,0.2);
}

.fp-nickname {
    font-weight: 700;
    color: #C8860A;
    width: 80px;
}

.fp-role {
    font-size: 10px;
    color: rgba(245, 240, 232, 0.4);
    width: 50px;
}

.fp-stats {
    color: rgba(245, 240, 232, 0.6);
    font-size: 11px;
}

.tournament-path {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(139, 94, 60, 0.2);
    padding: 16px;
    margin-bottom: 24px;
    text-align: left;
}

.path-title {
    font-size: 12px;
    font-weight: 700;
    color: rgba(200, 134, 10, 0.6);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 10px;
}

.path-matches {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.path-match {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    font-size: 12px;

    &--win {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
    }

    &--loss {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
    }
}

.pm-result {
    font-weight: 700;
    font-size: 14px;

    .path-match--win & { color: #22c55e; }
    .path-match--loss & { color: #ef4444; }
}

.pm-vs {
    color: #F5F0E8;
}

.pm-format {
    font-size: 10px;
    color: rgba(245, 240, 232, 0.4);
}

.gameover-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 20px;
}

.go-btn {
    padding: 12px 28px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    border: none;

    &--restart {
        background: linear-gradient(180deg, #C8860A 0%, #8B5E3C 100%);
        color: #1a0d06;
        clip-path: polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px);
    }

    &--restart:hover {
        background: linear-gradient(180deg, #e8a020 0%, #C8860A 100%);
        box-shadow: 0 0 20px rgba(200, 134, 10, 0.4);
    }

    &--home {
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(139, 94, 60, 0.4);
        color: rgba(245, 240, 232, 0.5);
        clip-path: none;
    }

    &--home:hover {
        border-color: #C8860A;
        color: #C8860A;
    }
}

.gameover-flavor {
    font-size: 12px;
    color: rgba(245, 240, 232, 0.2);
    font-style: italic;
    letter-spacing: 0.04em;
}
</style>
