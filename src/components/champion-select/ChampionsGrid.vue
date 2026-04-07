<template>
    <div class="w-full px-5" v-if="champions?.length" :class="{ 'cs-grid--locked': !interactive }">
        <div id="cs-container">
            <div v-for="(c, i) in champions" :key="i" class="portrait-wrapper">
                <ChampionPortrait
                    clickable
                    :key="c.name"
                    :phase="phase"
                    :selected="c.id == hoveredChampion"
                    :disabled="isUnavailable(c.id)"
                    :banned="bannedChampions.some(b => b.toLowerCase() === c.id.toLowerCase())"
                    :champion="{
                        name: c.name,
                        image: `/champions/${c.id}.png`,
                    }"
                    :knowledge="getKnowledge(c.id)"
                    @click="clickChampion(c.id)"
                />
            </div>
        </div>
    </div>
    <div class="mt-10 mb-5 flex justify-center">
        <div class="confirm-btn-wrapper">
            <button
                @click="confirmChampion"
                :disabled="!hoveredChampion"
                class="confirm-btn"
                :class="hoveredChampion ? 'confirm-btn--active' : 'confirm-btn--disabled'"
            >
                <span class="confirm-btn__text">{{ phase === 'ban' ? 'BAN CAMPEÃO' : 'CONFIRMAR' }}</span>
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Phase, SingleChampion } from '@/types/championSelect.types'
import { PropType } from 'vue'

import ChampionPortrait from './ChampionPortrait.vue'

const emit = defineEmits(['confirmedChamp', 'update:hoveredChampion'])
const props = defineProps({
    champions: Array as PropType<SingleChampion[]>,
    unavailableChampions: { type: Array as PropType<string[]>, required: true },
    bannedChampions: { type: Array as PropType<string[]>, required: true },
    phase: String as PropType<Phase>,
    hoveredChampion: { type: String, default: '' },
    knowledgeMap: { type: Object as PropType<Record<string, number>>, default: () => ({}) },
    showKnowledge: { type: Boolean, default: false },
    interactive: { type: Boolean, default: true },
})

const isUnavailable = (id: string): boolean =>
    props.unavailableChampions.some(b => b.toLowerCase() === id.toLowerCase())

const getKnowledge = (id: string): number | undefined => {
    if (!props.showKnowledge) return undefined
    return props.knowledgeMap[id]
}

const clickChampion = (champId: string): void => {
    if (!props.interactive) return
    if (!isUnavailable(champId)) emit('update:hoveredChampion', champId)
}

const confirmChampion = () => {
    if (!props.interactive) return
    emit('confirmedChamp', props.hoveredChampion)
    emit('update:hoveredChampion', '')
}
</script>

<style lang="scss">
.cs-grid--locked {
    pointer-events: none;
    opacity: 0.5;
}

#cs-container {
    height: 60vh;
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: 100px;
    @apply grid pt-3 overflow-y-scroll gap-2;
}
#cs-container::-webkit-scrollbar {
    @apply w-2 max-h-2;
}
#cs-container::-webkit-scrollbar-thumb {
    background: rgba(200, 134, 10, 0.6);
    border-radius: 4px;
}
#cs-container::-webkit-scrollbar-corner {
    background-color: rgba(0, 0, 0, 0);
}
.portrait-wrapper {
    max-height: 100px;
}

.confirm-btn {
    position: relative;
    width: 280px;
    height: 50px;
    font-family: 'Arial Narrow', Arial, sans-serif;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;

    &__text {
        position: relative;
        z-index: 2;
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        clip-path: polygon(22px 0%, calc(100% - 22px) 0%, 100% 50%, calc(100% - 22px) 100%, 22px 100%, 0% 50%);
    }

    &--active {
        color: #e8e8e8;

        &::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 0;
            clip-path: polygon(22px 0%, calc(100% - 22px) 0%, 100% 50%, calc(100% - 22px) 100%, 22px 100%, 0% 50%);
            background: linear-gradient(180deg, #8B5E3C 0%, #C8860A 50%, #5a3820 100%);
        }

        &::after {
            inset: 1.5px;
            background: linear-gradient(180deg, #2a1508 0%, #1a0d06 50%, #0d0603 100%);
        }

        &:hover {
            color: #C8860A;
            &::before {
                background: linear-gradient(180deg, #C8860A 0%, #e8a010 50%, #8B5E3C 100%);
            }
        }

        &:active {
            transform: translateY(1px);
        }
    }

    &--disabled {
        color: #3a4a52;
        cursor: not-allowed;

        &::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 0;
            clip-path: polygon(22px 0%, calc(100% - 22px) 0%, 100% 50%, calc(100% - 22px) 100%, 22px 100%, 0% 50%);
            background: #1e2a30;
        }

        &::after {
            inset: 1.5px;
            background: linear-gradient(180deg, #0e1418 0%, #0a1014 100%);
        }
    }
}

.confirm-btn-wrapper {
    position: relative;
    display: inline-block;

    &::before,
    &::after {
        content: '';
        position: absolute;
        top: -4px;
        width: 10px;
        height: 10px;
        border-top: 2px solid #C8860A;
        z-index: 10;
    }

    &::before {
        left: 18px;
        border-left: 2px solid #C8860A;
    }

    &::after {
        right: 18px;
        border-right: 2px solid #C8860A;
    }
}
</style>
