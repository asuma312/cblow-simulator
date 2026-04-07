<template>
    <div
        class="player-card"
        :class="{ 'player-card--selected': selected, 'player-card--clickable': clickable }"
        @click="clickable && $emit('click')"
    >
        <div class="player-card__header">
            <div>
                <p class="player-card__nickname">{{ player.nickname }}</p>
                <p class="player-card__name">{{ player.name }}</p>
            </div>
            <div class="player-card__role-badge" :class="`role--${player.role}`">
                {{ roleLabel }}
            </div>
        </div>

        <div class="player-card__stats">
            <div class="stat-row">
                <span class="stat-label">Farm</span>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill stat-fill--farm" :style="{ width: `${(player.stats.farm / 10) * 100}%` }" />
                </div>
                <span class="stat-value">{{ player.stats.farm.toFixed(1) }}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Mecânica</span>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill stat-fill--mec" :style="{ width: `${(player.stats.mechanics / 10) * 100}%` }" />
                </div>
                <span class="stat-value">{{ player.stats.mechanics.toFixed(1) }}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Teamfight</span>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill stat-fill--tf" :style="{ width: `${(player.stats.teamfight / 10) * 100}%` }" />
                </div>
                <span class="stat-value">{{ player.stats.teamfight.toFixed(1) }}</span>
            </div>
        </div>

        <div v-if="showStatus" class="player-card__status">
            <div class="status-item">
                <span class="status-label">Moral</span>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill" :style="{ width: `${player.moral}%`, background: moralColor }" />
                </div>
                <span class="stat-value">{{ Math.round(player.moral) }}</span>
            </div>
            <div class="status-item">
                <span class="status-label">Fadiga</span>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill" :style="{ width: `${player.fatigue}%`, background: fatigueColor }" />
                </div>
                <span class="stat-value">{{ Math.round(player.fatigue) }}</span>
            </div>
        </div>

        <div v-if="showPool" class="player-card__pool">
            <p class="pool-label">Pool:</p>
            <div class="pool-champs">
                <span v-for="c in player.champPool" :key="c.championId" class="pool-champ" :title="`${c.championId}: ${c.knowledge}`">
                    {{ c.championId.substring(0, 6) }}
                    <span class="pool-knowledge">{{ c.knowledge }}</span>
                </span>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ROLE_SHORT_LABELS } from '@/types/game.types'
import type { Player } from '@/types/game.types'

const props = defineProps({
    player: { type: Object as () => Player, required: true },
    selected: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    showStatus: { type: Boolean, default: false },
    showPool: { type: Boolean, default: false },
})

defineEmits(['click'])

function statusColor(value: number, reverse = false): string {
    const good = reverse ? value <= 30 : value >= 70
    const mid  = reverse ? value <= 60 : value >= 40
    if (good) return '#4ade80'
    if (mid)  return '#eab308'
    return '#ef4444'
}

const roleLabel    = computed(() => ROLE_SHORT_LABELS[props.player.role] ?? props.player.role.toUpperCase())
const moralColor   = computed(() => statusColor(props.player.moral))
const fatigueColor = computed(() => statusColor(props.player.fatigue, true))
</script>

<style lang="scss" scoped>
.player-card {
    background: #2a1508;
    border: 1px solid #8B5E3C;
    padding: 12px;
    transition: all 0.2s ease;
    clip-path: polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px);
}

.player-card--clickable {
    cursor: pointer;
}

.player-card--clickable:hover {
    border-color: #C8860A;
    box-shadow: 0 0 12px rgba(200, 134, 10, 0.3);
}

.player-card--selected {
    border-color: #C8860A;
    box-shadow: 0 0 16px rgba(200, 134, 10, 0.5);
    background: #3a2010;
}

.player-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
}

.player-card__nickname {
    font-size: 16px;
    font-weight: 700;
    color: #C8860A;
    letter-spacing: 0.06em;
}

.player-card__name {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.6);
    margin-top: 2px;
}

.player-card__role-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 2px 6px;
    border-radius: 2px;
}

.role--top    { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); }
.role--jungle { background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.4); }
.role--mid    { background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.4); }
.role--adc    { background: rgba(234, 179, 8, 0.2); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.4); }
.role--support { background: rgba(168, 85, 247, 0.2); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.4); }

.player-card__stats {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.stat-row, .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.stat-label, .status-label {
    font-size: 10px;
    color: rgba(245, 240, 232, 0.5);
    width: 58px;
    flex-shrink: 0;
    letter-spacing: 0.04em;
}

.stat-bar-track {
    flex: 1;
    height: 5px;
    background: rgba(0,0,0,0.4);
    border-radius: 3px;
    overflow: hidden;
}

.stat-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
}

.stat-fill--farm { background: linear-gradient(90deg, #C8860A, #e8a020); }
.stat-fill--mec  { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.stat-fill--tf   { background: linear-gradient(90deg, #ef4444, #f87171); }

.stat-value {
    font-size: 10px;
    color: #C8860A;
    font-weight: 700;
    width: 24px;
    text-align: right;
}

.player-card__status {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(139, 94, 60, 0.3);
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.player-card__pool {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(139, 94, 60, 0.3);
}

.pool-label {
    font-size: 10px;
    color: rgba(245, 240, 232, 0.5);
    margin-bottom: 4px;
}

.pool-champs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.pool-champ {
    font-size: 9px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(139, 94, 60, 0.4);
    padding: 1px 5px;
    color: #F5F0E8;
    display: flex;
    gap: 3px;
    align-items: center;
}

.pool-knowledge {
    color: #C8860A;
    font-weight: 700;
}


</style>
