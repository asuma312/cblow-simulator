import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index'
import './assets/main.css'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')

if ((import.meta as unknown as { env: { DEV: boolean } }).env.DEV) {
    import('./utils/debug').then(({ registerDebugHelpers }) => {
        registerDebugHelpers(pinia, router)
    })
}
