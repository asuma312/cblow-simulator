<template>
    <div class="game-log">
        <div class="game-log__events" ref="logContainer">
            <transition-group name="event" tag="div">
                <div
                    v-for="(event, idx) in visibleEvents"
                    :key="idx"
                    class="game-log__event"
                    :class="eventClass(event.advantageDelta)"
                >
                    <span class="event-minute">{{ event.minute }}'</span>
                    <span class="event-desc">{{ event.description }}</span>
                    <span class="event-delta" :class="event.advantageDelta >= 0 ? 'delta--pos' : 'delta--neg'">
                        {{ event.advantageDelta >= 0 ? '+' : '' }}{{ event.advantageDelta }}
                    </span>
                </div>
            </transition-group>
        </div>

        <div class="game-log__advantage">
            <div class="advantage-label">
                <span class="adv-team">Seu Time</span>
                <span class="adv-center">Vantagem</span>
                <span class="adv-team">Adversário</span>
            </div>
            <div class="advantage-bar-track">
                <div
                    class="advantage-bar-fill"
                    :style="advantageBarStyle"
                />
                <div class="advantage-center-line" />
            </div>
            <div class="advantage-number" :class="totalAdvantage >= 0 ? 'adv--pos' : 'adv--neg'">
                {{ totalAdvantage >= 0 ? '+' : '' }}{{ totalAdvantage }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue'
import type { GameEvent } from '@/types/game.types'

const props = defineProps({
    events: { type: Array as () => GameEvent[], required: true },
    currentIndex: { type: Number, default: 0 },
})

const logContainer = ref<HTMLElement>()

const visibleEvents = computed(() => props.events.slice(0, props.currentIndex))

const totalAdvantage = computed(() =>
    visibleEvents.value.reduce((sum, e) => sum + e.advantageDelta, 0)
)

const advantageBarStyle = computed(() => {
    const adv = totalAdvantage.value
    const maxAdv = 50
    const pct = Math.max(-maxAdv, Math.min(maxAdv, adv))
    const fillPct = ((pct + maxAdv) / (2 * maxAdv)) * 100

    let bg = 'rgba(200, 134, 10, 0.8)'
    if (adv < -10) bg = 'rgba(239, 68, 68, 0.8)'
    else if (adv > 10) bg = 'rgba(34, 197, 94, 0.8)'

    return {
        left: adv >= 0 ? '50%' : `${fillPct}%`,
        width: `${Math.abs(pct) / maxAdv * 50}%`,
        background: bg,
    }
})

const eventClass = (delta: number) => {
    if (delta >= 10) return 'game-log__event--big-pos'
    if (delta >= 0) return 'game-log__event--pos'
    if (delta <= -10) return 'game-log__event--big-neg'
    return 'game-log__event--neg'
}

watch(() => props.currentIndex, async () => {
    await nextTick()
    if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
})
</script>

<style lang="scss" scoped>
.game-log {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
}

.game-log__events {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 4px;
    max-height: 400px;
}

.game-log__event {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: rgba(0,0,0,0.3);
    border-left: 3px solid;
    font-size: 13px;
    animation: slide-in 0.3s ease forwards;

    &--pos { border-color: #22c55e; }
    &--neg { border-color: #ef4444; }
    &--big-pos { border-color: #4ade80; background: rgba(34, 197, 94, 0.1); }
    &--big-neg { border-color: #f87171; background: rgba(239, 68, 68, 0.1); }
}

@keyframes slide-in {
    from { transform: translateX(-10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.event-minute {
    font-size: 11px;
    font-weight: 700;
    color: #C8860A;
    min-width: 28px;
    letter-spacing: 0.05em;
}

.event-desc {
    flex: 1;
    color: #F5F0E8;
}

.event-delta {
    font-size: 11px;
    font-weight: 700;
    min-width: 30px;
    text-align: right;
}

.delta--pos { color: #22c55e; }
.delta--neg { color: #ef4444; }

.game-log__advantage {
    padding: 12px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(139, 94, 60, 0.3);
}

.advantage-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: rgba(245, 240, 232, 0.5);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.adv-center {
    color: rgba(200, 134, 10, 0.6);
}

.advantage-bar-track {
    position: relative;
    width: 100%;
    height: 12px;
    background: rgba(0,0,0,0.4);
    border-radius: 6px;
    overflow: hidden;
}

.advantage-bar-fill {
    position: absolute;
    top: 0;
    height: 100%;
    border-radius: 6px;
    transition: all 0.5s ease;
}

.advantage-center-line {
    position: absolute;
    left: 50%;
    top: 0;
    width: 2px;
    height: 100%;
    background: rgba(245, 240, 232, 0.3);
    transform: translateX(-50%);
}

.advantage-number {
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    margin-top: 8px;
    letter-spacing: 0.05em;

    &.adv--pos { color: #22c55e; }
    &.adv--neg { color: #ef4444; }
}

.event-enter-active {
    transition: all 0.3s ease;
}
.event-enter-from {
    transform: translateX(-20px);
    opacity: 0;
}
</style>
