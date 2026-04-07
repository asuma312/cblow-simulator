<template>
    <div class="absolute w-full min-h-screen h-full">
        <img
            class="absolute w-full h-full bg-image"
            :src="champion && phase == 'pick' ? `/champions/splash/${champion}_0.jpg` : 'https://i.imgur.com/2Qyocz8.png'"
            @error="onSplashError"
        />
        <div class="absolute w-full h-full vignette" :class="`vignette--${phase}`"></div>
    </div>
</template>

<script lang="ts" setup>
import type { Phase } from '@/types/championSelect.types'
import { PropType } from 'vue'
import { onSplashError } from '@/utils/championImages'

defineProps({
    champion: String,
    phase: { type: String as PropType<Phase>, required: true },
})
</script>

<style lang="scss">
.bg-image {
    z-index: -10;
    filter: brightness(20%) saturate(60%);
}
.vignette {
    z-index: -1;
}
.vignette--pick {
    background: radial-gradient(ellipse at center, rgba(20, 8, 2, 0.4) 0%, rgba(10, 4, 1, 0.85) 70%, rgba(5, 2, 0, 0.97) 100%);
}
.vignette--ban {
    background: radial-gradient(ellipse at center, rgba(20, 8, 2, 0.5) 0%, rgba(10, 4, 1, 0.88) 65%, rgba(5, 2, 0, 0.97) 100%);
}
</style>
