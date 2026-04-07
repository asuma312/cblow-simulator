<template>
    <div class="training-action">
        <p class="ta-player">{{ player.nickname }}</p>
        <div class="ta-actions">
            <button
                v-for="action in TRAINING_ACTIONS"
                :key="action.type"
                class="ta-btn"
                :class="{ 'ta-btn--active': isSelected(action.type) }"
                @click="selectAction(action.type)"
            >
                <span class="ta-btn__label">{{ action.label }}</span>
            </button>
        </div>

        <!-- Champion selector for studyChampion -->
        <div v-if="selectedType === 'studyChampion'" class="ta-champ-select">
            <select v-model="selectedChampion" class="ta-champ-dropdown">
                <option value="">Selecionar campeão...</option>
                <option v-for="c in player.champPool" :key="c.championId" :value="c.championId">
                    {{ c.championId }} ({{ c.knowledge }})
                </option>
            </select>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { Player, TrainingAction } from '@/types/game.types'
import { TRAINING_ACTIONS } from '@/data/trainingActions'

const props = defineProps({
    player: { type: Object as () => Player, required: true },
    currentAction: { type: Object as () => TrainingAction | null, default: null },
})

const emit = defineEmits<{
    (e: 'update:action', action: TrainingAction): void
}>()

const selectedType = ref<string>(props.currentAction?.type ?? '')
const selectedChampion = ref<string>(
    props.currentAction?.type === 'studyChampion' ? (props.currentAction as any).championId : ''
)

const isSelected = (type: string): boolean => selectedType.value === type

const selectAction = (type: string) => {
    selectedType.value = type
    if (type !== 'studyChampion') {
        emit('update:action', { type } as TrainingAction)
    }
}

watch(selectedChampion, (champ) => {
    if (champ && selectedType.value === 'studyChampion') {
        emit('update:action', { type: 'studyChampion', championId: champ })
    }
})
</script>

<style lang="scss" scoped>
.training-action {
    background: #2a1508;
    border: 1px solid #8B5E3C;
    padding: 12px;
    clip-path: polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px);
}

.ta-player {
    font-size: 14px;
    font-weight: 700;
    color: #C8860A;
    margin-bottom: 10px;
    letter-spacing: 0.06em;
}

.ta-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.ta-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(139, 94, 60, 0.4);
    color: rgba(245, 240, 232, 0.7);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 0.04em;

    &:hover {
        border-color: #C8860A;
        color: #C8860A;
        background: rgba(200, 134, 10, 0.1);
    }

    &--active {
        border-color: #C8860A !important;
        color: #C8860A !important;
        background: rgba(200, 134, 10, 0.15) !important;
    }
}

.ta-btn__icon {
    font-size: 12px;
}

.ta-btn__label {
    font-size: 11px;
}

.ta-champ-select {
    margin-top: 8px;
}

.ta-champ-dropdown {
    width: 100%;
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(139, 94, 60, 0.5);
    color: #F5F0E8;
    padding: 6px 8px;
    font-size: 12px;
    outline: none;
    cursor: pointer;

    &:focus {
        border-color: #C8860A;
    }

    option {
        background: #1a0d06;
    }
}
</style>
