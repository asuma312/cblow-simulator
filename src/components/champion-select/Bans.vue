<template>
    <div class="bans-row" :class="props.side == 'blue' ? 'bans-row--blue' : 'bans-row--red'">
        <div v-for="i in 5" :key="i" class="ban-slot" :class="{ 'ban-slot--filled': bans?.[i - 1]?.name }">
            <template v-if="bans?.[i - 1]?.name">
                <img :src="bans[i - 1].image" :alt="bans[i - 1].name" class="ban-img" @error="onIconError" />
                <div class="ban-overlay">
                    <svg viewBox="0 0 24 24" class="ban-x-icon" fill="none" stroke="currentColor">
                        <line x1="5" y1="5" x2="19" y2="19" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="19" y1="5" x2="5" y2="19" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                </div>
            </template>
            <template v-else>
                <div class="ban-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-4 h-4 opacity-30">
                        <circle cx="12" cy="12" r="9" stroke-width="1.5"/>
                        <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import type { Champions, Side } from '@/types/championSelect.types'
import { onIconError } from '@/utils/championImages'

const props = defineProps({
    bans: Array as PropType<Champions>,
    side: String as PropType<Side>,
})
</script>

<style lang="scss" scoped>
.bans-row {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 8px 12px;

    &--red {
        flex-direction: row-reverse;
    }
}

.ban-slot {
    width: 40px;
    height: 40px;
    position: relative;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(100, 120, 130, 0.35);
    clip-path: polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px);
    overflow: hidden;
    transition: border-color 0.2s;

    &--filled {
        border-color: rgba(180, 40, 40, 0.5);
    }
}

.ban-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(40%) brightness(0.7);
}

.ban-overlay {
    position: absolute;
    inset: 0;
    background: rgba(120, 15, 15, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;

    .ban-x-icon {
        width: 16px;
        height: 16px;
        color: rgba(255, 80, 80, 0.9);
    }
}

.ban-empty-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a6070;
}
</style>
