<template>
    <svg
        :width="width"
        class="aspect-square"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 640 640"
    >
        <defs>
            <path d="M0 0L20 0L20 160L0 160L0 0Z" id="a4bgP0iHG" />
            <path d="M160 0L160 20L0 20L0 0L160 0Z" id="ctM8vo92L" />
            <path d="M620 0L640 0L640 160L620 160L620 0Z" id="fTZ4b99ML" />
            <path d="M640 0L640 20L480 20L480 0L640 0Z" id="a2KbdMXQAq" />
            <path d="M0 480L20 480L20 640L0 640L0 480Z" id="cgwi8PSGP" />
            <path d="M160 622.42L160 641.42L0 641.42L0 622.42L160 622.42Z" id="bsjBNA3ZK" />
            <path d="M620 480L640 480L640 640L620 640L620 480Z" id="bP0DhuBYH" />
            <path d="M640 623.41L640 642.42L480 642.42L480 623.41L640 623.41Z" id="e1gofJUbrC" />
        </defs>
        <g>
            <g><use xlink:href="#a4bgP0iHG" opacity="1" :fill="color" fill-opacity="1" /></g>
            <g><use xlink:href="#ctM8vo92L" opacity="1" :fill="color" fill-opacity="1" /></g>
            <g><use xlink:href="#fTZ4b99ML" opacity="1" :fill="color" fill-opacity="1" /></g>
            <g><use xlink:href="#a2KbdMXQAq" opacity="1" :fill="color" fill-opacity="1" /></g>
            <g><use xlink:href="#cgwi8PSGP" opacity="1" :fill="color" fill-opacity="1" /></g>
            <g><use xlink:href="#bsjBNA3ZK" opacity="1" :fill="color" fill-opacity="1" /></g>
            <g><use xlink:href="#bP0DhuBYH" opacity="1" :fill="color" fill-opacity="1" /></g>
            <g><use xlink:href="#e1gofJUbrC" opacity="1" :fill="color" fill-opacity="1" /></g>
        </g>
    </svg>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
defineProps({
    width: Number as PropType<number>,
    height: Number as PropType<number>,
    color: String as PropType<string>,
})
</script>
