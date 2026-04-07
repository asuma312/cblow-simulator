<template>
    <div class="portrait" :class="[portraitClass, { 'portrait--clickable': clickable }]">
        <div class="portrait__frame">
            <img
                class="portrait__img"
                :class="{
                    'portrait__img--grayscale': props.disabled || selected || props.banned,
                    'portrait__img--banned': props.banned,
                }"
                :key="champion?.name"
                :src="champion?.image"
                :alt="champion?.name"
                :width="imageSize"
                :height="imageSize"
                @error="onIconError"
            />

            <div v-if="selected && phase == 'pick'" class="portrait__ring portrait__ring--pick" />
            <div v-if="selected && phase == 'ban'" class="portrait__ring portrait__ring--ban" />

            <HoverIcon
                :width="imageSize"
                v-if="selected"
                class="portrait__hover-icon"
                :color="phase == 'ban' ? '#b91c1c' : '#c8aa6e'"
            />

            <div v-if="props.banned" class="portrait__ban-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,80,80,0.9)" class="portrait__ban-x">
                    <line x1="5" y1="5" x2="19" y2="19" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="19" y1="5" x2="5" y2="19" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
            </div>

            <BanIcon
                :width="imageSize"
                v-if="selected && phase == 'ban'"
                class="portrait__hover-icon"
                :color="'#b91c1c'"
            />

            <!-- Knowledge badge -->
            <div v-if="knowledge !== undefined" class="portrait__knowledge" :class="knowledgeClass">
                {{ knowledge }}
            </div>
        </div>

        <p class="portrait__name" v-if="!hideName">{{ champion?.name }}</p>
    </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue'

import type { ChampionPortrait, Phase, Side } from '@/types/championSelect.types'
import { onIconError } from '@/utils/championImages'

import HoverIcon from './icons/HoverIcon.vue'
import BanIcon from './icons/BanIcon.vue'

const props = defineProps({
    champion: Object as PropType<ChampionPortrait>,
    clickable: { type: Boolean, default: false },
    rounded: { type: Boolean, default: false },
    hideName: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    side: String as PropType<Side>,
    phase: String as PropType<Phase>,
    knowledge: Number as PropType<number>,
})

const imageSize = 80

const portraitClass = computed(() => {
    const classes: string[] = []
    if (props.selected) classes.push(props.phase === 'ban' ? 'portrait--selected-ban' : 'portrait--selected-pick')
    if (props.rounded) classes.push('portrait--rounded')
    return classes
})

const knowledgeClass = computed(() => {
    if (props.knowledge === undefined) return ''
    if (props.knowledge >= 80) return 'portrait__knowledge--high'
    if (props.knowledge >= 50) return 'portrait__knowledge--mid'
    return 'portrait__knowledge--low'
})
</script>

<style lang="scss" scoped>
.portrait {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;

    &--clickable {
        cursor: pointer;

        &:hover .portrait__frame {
            border-color: rgba(200, 168, 78, 0.45);
            box-shadow: 0 0 8px rgba(200, 168, 78, 0.15);
        }
    }

    &--selected-pick .portrait__frame {
        border-color: #c8aa6e !important;
        box-shadow: 0 0 14px rgba(200, 168, 78, 0.5), inset 0 0 8px rgba(200, 168, 78, 0.1) !important;
    }

    &--selected-ban .portrait__frame {
        border-color: #b91c1c !important;
        box-shadow: 0 0 14px rgba(185, 28, 28, 0.5) !important;
    }

    &--rounded .portrait__frame {
        border-radius: 50%;
        overflow: hidden;
        clip-path: none !important;
    }
}

.portrait__frame {
    position: relative;
    width: 80px;
    height: 80px;
    border: 1px solid rgba(91, 90, 86, 0.4);
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
    clip-path: polygon(
        6px 0%, calc(100% - 6px) 0%,
        100% 6px, 100% calc(100% - 6px),
        calc(100% - 6px) 100%, 6px 100%,
        0% calc(100% - 6px), 0% 6px
    );
}

.portrait__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: filter 0.2s;

    &--grayscale {
        filter: grayscale(80%) brightness(0.7);
    }

    &--banned {
        filter: grayscale(100%) brightness(0.45) !important;
    }
}

.portrait__ring {
    position: absolute;
    inset: 0;
    pointer-events: none;

    &--pick {
        box-shadow: inset 0 0 0 2px #c8aa6e;
    }

    &--ban {
        box-shadow: inset 0 0 0 2px #b91c1c;
    }
}

.portrait__hover-icon {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    cursor: pointer;
}

.portrait__ban-overlay {
    position: absolute;
    inset: 0;
    background: rgba(100, 10, 10, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.portrait__ban-x {
    width: 28px;
    height: 28px;
}

.portrait__name {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: #a09b8c;
    text-align: center;
    max-width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
}

.portrait__knowledge {
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 9px;
    font-weight: 700;
    padding: 1px 3px;
    border-radius: 2px;
    z-index: 5;

    &--high {
        background: rgba(34, 197, 94, 0.8);
        color: #fff;
    }

    &--mid {
        background: rgba(234, 179, 8, 0.8);
        color: #000;
    }

    &--low {
        background: rgba(239, 68, 68, 0.8);
        color: #fff;
    }
}
</style>
