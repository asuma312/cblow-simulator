import { ref, watch } from 'vue'

export function useTimer(durationSeconds: number = 30) {
    const timeLeft = ref(durationSeconds)
    const progress = ref(1)
    let interval: ReturnType<typeof setInterval> | null = null

    watch(timeLeft, (val) => {
        progress.value = val / durationSeconds
    })

    const stop = () => {
        if (interval) clearInterval(interval)
        interval = null
    }

    const reset = () => {
        stop()
        timeLeft.value = durationSeconds
        progress.value = 1
    }

    const start = () => {
        stop()
        timeLeft.value = durationSeconds
        progress.value = 1
        interval = setInterval(() => {
            if (timeLeft.value > 0) {
                timeLeft.value--
            } else {
                clearInterval(interval!)
            }
        }, 1000)
    }

    return { timeLeft, progress, start, stop, reset }
}
