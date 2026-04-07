<template>
    <svg
        :width="width"
        :stroke="color"
        class="aspect-square"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
    </svg>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'

defineProps({
    width: Number as PropType<number>,
    color: {
        type: String as PropType<string>,
        default: 'gray',
    },
})
</script>
