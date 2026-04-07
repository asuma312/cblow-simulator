<template>
    <div class="home-view">
        <div class="home-bg"></div>
        <div class="home-content">
            <div class="home-mascot">CBLOW</div>
            <div class="home-title-wrapper">
                <p class="home-subtitle-top">CAMPEONATO BRASILEIRO</p>
                <h1 class="home-title">CBLOW</h1>
                <p class="home-year">2026</p>
            </div>
            <p class="home-tagline">O MAIOR CAMPEONATO DE LOW ELO DO MUNDO</p>

            <div class="home-divider">
                <div class="divider-line" />
                <div class="divider-diamond" />
                <div class="divider-line" />
            </div>

            <div class="home-buttons">
                <button class="home-btn home-btn--start" @click="startGame">
                    COMEÇAR JOGO
                </button>
                <button v-if="hasSave" class="home-btn home-btn--continue" @click="continueGame">
                    CONTINUAR
                </button>
                <button v-if="hasSave" class="home-btn home-btn--reset" @click="resetGame">
                    NOVO JOGO
                </button>
            </div>

            <p class="home-lore">
                Você foi contratado para montar e gerenciar um time de League of Legends.<br>
                Recrute jogadores, treine sua equipe e conquiste o CBlow Championship!
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

const router = useRouter()
const gameStore = useGameStore()
const teamStore = useTeamStore()
const tournamentStore = useTournamentStore()

const hasSave = computed(() => {
    return gameStore.phase !== 'setup' || teamStore.teamName !== ''
})

const startGame = () => {
    router.push('/setup')
}

const continueGame = () => {
    const phaseRoutes: Record<string, string> = {
        setup: '/setup',
        training: '/training',
        champselect: '/champselect',
        gameplay: '/gameplay',
        tournament: '/tournament',
        gameover: '/gameover',
        victory: '/gameover',
    }
    const route = phaseRoutes[gameStore.phase] ?? '/setup'
    router.push(route)
}

const resetGame = () => {
    gameStore.reset()
    teamStore.resetTeam()
    tournamentStore.reset()
    router.push('/setup')
}
</script>

<style scoped>
.home-view {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: #1a0d06;
}

.home-bg {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse at 50% 30%, rgba(200, 134, 10, 0.12) 0%, transparent 60%),
        radial-gradient(ellipse at 20% 80%, rgba(139, 94, 60, 0.1) 0%, transparent 40%);
}

.home-content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 40px 20px;
    max-width: 600px;
    width: 100%;
}

.home-mascot {
    font-size: 80px;
    margin-bottom: 12px;
    animation: float 3s ease-in-out infinite;
    filter: drop-shadow(0 0 20px rgba(200, 134, 10, 0.5));
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

.home-title-wrapper {
    position: relative;
    margin-bottom: 8px;
}

.home-subtitle-top {
    font-size: 12px;
    letter-spacing: 0.25em;
    color: rgba(200, 134, 10, 0.7);
    text-transform: uppercase;
    margin-bottom: 4px;
}

.home-title {
    font-size: 96px;
    font-weight: 900;
    letter-spacing: 0.12em;
    color: transparent;
    background: linear-gradient(180deg, #e8a020 0%, #C8860A 40%, #8B5E3C 70%, #5a3820 100%);
    -webkit-background-clip: text;
    background-clip: text;
    line-height: 1;
    text-shadow: none;
    filter: drop-shadow(0 0 30px rgba(200, 134, 10, 0.4));
    margin: 0;
}

.home-year {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: rgba(200, 134, 10, 0.6);
    margin-top: -8px;
}

.home-tagline {
    font-size: 12px;
    letter-spacing: 0.2em;
    color: rgba(245, 240, 232, 0.5);
    text-transform: uppercase;
    margin: 8px 0 20px;
}

.home-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
}

.divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200, 134, 10, 0.5), transparent);
}

.divider-diamond {
    width: 8px;
    height: 8px;
    border: 1px solid #C8860A;
    transform: rotate(45deg);
}

.home-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
}

.home-btn {
    width: 280px;
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
    clip-path: polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px);
    border: none;
}

.home-btn--start {
    background: linear-gradient(180deg, #C8860A 0%, #8B5E3C 100%);
    color: #1a0d06;
}

.home-btn--start:hover {
    background: linear-gradient(180deg, #e8a020 0%, #C8860A 100%);
    box-shadow: 0 0 24px rgba(200, 134, 10, 0.5);
    transform: translateY(-2px);
}

.home-btn--continue {
    background: rgba(0,0,0,0.4);
    border: 1px solid #C8860A;
    color: #C8860A;
}

.home-btn--continue:hover {
    background: rgba(200, 134, 10, 0.15);
}

.home-btn--reset {
    background: transparent;
    border: 1px solid rgba(139, 94, 60, 0.5);
    color: rgba(245, 240, 232, 0.4);
    font-size: 12px;
    padding: 8px 20px;
    width: 160px;
    clip-path: none;
}

.home-btn--reset:hover {
    color: rgba(239, 68, 68, 0.8);
    border-color: rgba(239, 68, 68, 0.5);
}

.home-lore {
    font-size: 12px;
    line-height: 1.7;
    color: rgba(245, 240, 232, 0.35);
    letter-spacing: 0.04em;
    max-width: 460px;
    margin: 0 auto;
}
</style>
