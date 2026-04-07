<template>
    <div class="flex w-full my-2" :class="{ 'flex-row-reverse': rhombusVisible && side == 'red' }">
        <div v-if="rhombusVisible" class="rhombus" />
        <div :class="side ? `divider-line-${side}` : 'divider-line'" />
    </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import type { Side } from '@/types/championSelect.types'

defineProps({
    rhombusVisible: { type: Boolean, default: false },
    side: String as PropType<Side>,
})
</script>

<style lang="scss" scoped>
.rhombus {
    border: 1px solid #C8860A;
    transform: rotate(45deg);
    backface-visibility: hidden;
    height: 8px;
    width: 8px;
}
.divider-line {
    width: 100%;
    background: #C8860A;
    margin-top: 2.5px;
    height: 1px;
}
.divider-line-blue {
    width: 100%;
    margin-top: 2.5px;
    height: 1px;
    background: -webkit-gradient(radial, 1% 1%, 0, 50% 50%, 350, from(rgba(200, 134, 10, 1)), to(transparent));
}
.divider-line-red {
    width: 100%;
    margin-top: 2.5px;
    height: 1px;
    background: -webkit-gradient(radial, 1% 1%, 0, 50% 50%, 350, from(transparent), to(rgba(200, 134, 10, 1)));
}
</style>
