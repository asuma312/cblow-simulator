import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SetupView from '@/views/SetupView.vue'
import TournamentView from '@/views/TournamentView.vue'
import TrainingView from '@/views/TrainingView.vue'
import ChampSelectView from '@/views/ChampSelectView.vue'
import GameplayView from '@/views/GameplayView.vue'
import GameOverView from '@/views/GameOverView.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/setup', name: 'setup', component: SetupView },
        { path: '/tournament', name: 'tournament', component: TournamentView },
        { path: '/training', name: 'training', component: TrainingView },
        { path: '/champselect', name: 'champselect', component: ChampSelectView },
        { path: '/gameplay', name: 'gameplay', component: GameplayView },
        { path: '/gameover', name: 'gameover', component: GameOverView },
    ],
})

export default router
