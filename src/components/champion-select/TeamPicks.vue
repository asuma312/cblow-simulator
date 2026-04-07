<template>
    <div class="team-picks" :class="side == 'blue' ? 'team-picks--blue' : 'team-picks--red'">
        <Divider rhombus-visible :side="side" />
        <div v-for="i in 5" :key="i">
            <div class="pick-slot" :class="{ 'pick-slot--reverse': position == 'right', 'pick-slot--active': isActiveSlot(i) }">
                <template v-if="champions && champions[i - 1]">
                    <div class="pick-slot__portrait">
                        <ChampionPortrait hideName rounded :champion="champions[i - 1]" :side="side" />
                    </div>
                    <div class="pick-slot__info">
                        <p class="pick-slot__champ-name">{{ capitalize(champions[i - 1].name) }}</p>
                        <p class="pick-slot__role pick-slot__role--muted">{{ roleLabel(i) }}</p>
                        <p class="pick-slot__summoner">{{ playerNames[i - 1] }}</p>
                    </div>
                </template>
                <template v-else>
                    <div
                        class="pick-slot__empty"
                        :class="{
                            'pick-slot__empty--blue': side == 'blue',
                            'pick-slot__empty--red': side == 'red',
                            'pick-slot__empty--active': isActiveSlot(i),
                        }"
                    >
                        <img
                            v-if="hoveredChampion && isActiveSlot(i)"
                            :src="`/champions/${hoveredChampion}.png`"
                            class="pick-slot__hovered-img"
                        />
                        <div v-else class="pick-slot__empty-inner" />
                    </div>
                    <div class="pick-slot__info">
                        <template v-if="isActiveSlot(i)">
                            <p class="pick-slot__choosing">Escolhendo...</p>
                            <p class="pick-slot__role">{{ roleLabel(i) }}</p>
                            <p class="pick-slot__summoner">{{ playerNames[i - 1] }}</p>
                        </template>
                        <template v-else>
                            <p class="pick-slot__role pick-slot__role--muted">{{ roleLabel(i) }}</p>
                            <p class="pick-slot__summoner">{{ playerNames[i - 1] }}</p>
                        </template>
                    </div>
                </template>
            </div>
            <Divider rhombus-visible :side="side" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'

import type { Side, Champions, Position } from '@/types/championSelect.types'
import ChampionPortrait from './ChampionPortrait.vue'
import Divider from './Divider.vue'

const props = defineProps({
    side: String as PropType<Side>,
    position: String as PropType<Position>,
    champions: Array as PropType<Champions>,
    hoveredChampion: String,
    isActiveTurn: { type: Boolean, default: false },
    playerNames: { type: Array as PropType<string[]>, default: () => ['Top', 'Jungle', 'Mid', 'ADC', 'Support'] },
})

const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Suporte']

const capitalize = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1)
const roleLabel = (slotIndex: number): string => ROLES[slotIndex - 1] ?? ''
const isActiveSlot = (i: number): boolean => props.isActiveTurn && i === (props.champions?.length ?? 0) + 1
</script>

<style lang="scss" scoped>
.team-picks {
    width: 100%;
    margin-top: 12px;

    &--blue {
        padding-left: 16px;
        padding-right: 16px;
    }

    &--red {
        padding-left: 16px;
        padding-right: 16px;
    }
}

.pick-slot {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 8px;
    transition: background 0.2s, box-shadow 0.2s;

    &--reverse {
        flex-direction: row-reverse;
    }

    &--active {
        background: linear-gradient(90deg, rgba(200, 134, 10, 0.18) 0%, rgba(200, 134, 10, 0.06) 60%, transparent 100%);
        box-shadow:
            inset 2px 0 0 rgba(200, 134, 10, 1),
            inset 0 1px 0 rgba(200, 134, 10, 0.3),
            inset 0 -1px 0 rgba(200, 134, 10, 0.3);
        animation: slot-pulse 1.8s ease-in-out infinite;
    }

    &--reverse#{&}--active {
        background: linear-gradient(270deg, rgba(200, 134, 10, 0.18) 0%, rgba(200, 134, 10, 0.06) 60%, transparent 100%);
        box-shadow:
            inset -2px 0 0 rgba(200, 134, 10, 1),
            inset 0 1px 0 rgba(200, 134, 10, 0.3),
            inset 0 -1px 0 rgba(200, 134, 10, 0.3);
    }
}

@keyframes slot-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
}

.pick-slot__portrait {
    flex-shrink: 0;
}

.pick-slot__empty {
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    border-radius: 50%;
    border: 2px solid transparent;
    background: rgba(0, 0, 0, 0.6);
    transition: border-color 0.2s;

    &--blue {
        border-color: rgba(200, 134, 10, 0.4);
    }

    &--red {
        border-color: rgba(180, 40, 40, 0.45);
    }

    &--active {
        border-color: rgba(200, 134, 10, 0.7) !important;
        box-shadow: 0 0 12px rgba(200, 134, 10, 0.25);
    }
}

.pick-slot__empty-inner {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(42, 21, 8, 0.8) 0%, rgba(10, 5, 2, 0.95) 100%);
}

.pick-slot__hovered-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(100%) brightness(0.6);
}

.pick-slot__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.pick-slot__choosing {
    font-size: 11px;
    font-weight: 600;
    color: #C8860A;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    animation: pulse-gold 1.4s ease-in-out infinite;
}

.pick-slot__role {
    font-size: 13px;
    font-weight: 700;
    color: #F5F0E8;
    letter-spacing: 0.05em;

    &--muted {
        color: rgba(200, 134, 10, 0.5);
        font-weight: 600;
    }
}

@keyframes pulse-gold {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
}

.pick-slot__champ-name {
    font-size: 13px;
    font-weight: 700;
    color: #C8860A;
    letter-spacing: 0.04em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pick-slot__summoner {
    font-size: 11px;
    color: rgba(245, 240, 232, 0.6);
    letter-spacing: 0.03em;
}
</style>
