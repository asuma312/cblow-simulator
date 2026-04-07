<template>
    <div class="grid-header">
        <div class="role-filters">
            <button
                v-for="role in roles"
                :key="role.id"
                class="role-btn"
                :class="{ 'role-btn--active': activeRole === role.id }"
                @click="selectRole(role.id)"
                :title="role.label"
            >
                <img v-if="role.icon" :src="role.icon" :alt="role.label" class="role-btn__img" />
                <span v-else class="role-btn__all">ALL</span>
            </button>
        </div>

        <div class="search-wrapper">
            <div class="search-line search-line--left" />
            <div class="search-field">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="7" stroke-width="1.5"/>
                    <line x1="16.5" y1="16.5" x2="22" y2="22" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <input
                    v-model="queryFilter"
                    class="search-input"
                    type="text"
                    placeholder="BUSCAR"
                />
            </div>
            <div class="search-line search-line--right" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ROLE_ICONS } from '@/data/champions'

const emit = defineEmits(['queryUpdated', 'roleUpdated'])
const queryFilter = ref('')
const activeRole = ref('all')

watch(queryFilter, (val: string) => emit('queryUpdated', val))

const selectRole = (roleId: string) => {
    activeRole.value = roleId
    emit('roleUpdated', roleId)
}

const roles = [
    { id: 'all',     label: 'Todos',   icon: ROLE_ICONS.all },
    { id: 'top',     label: 'Top',     icon: ROLE_ICONS.top },
    { id: 'jungle',  label: 'Jungle',  icon: ROLE_ICONS.jungle },
    { id: 'mid',     label: 'Mid',     icon: ROLE_ICONS.mid },
    { id: 'bottom',  label: 'Bottom',  icon: ROLE_ICONS.bottom },
    { id: 'support', label: 'Suporte', icon: ROLE_ICONS.support },
]
</script>

<style lang="scss" scoped>
.grid-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 0 12px 8px;
}

.role-filters {
    display: flex;
    gap: 6px;
    align-items: center;
}

.role-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(139, 94, 60, 0.3);
    color: rgba(200, 134, 10, 0.5);
    cursor: pointer;
    transition: all 0.15s ease;
    clip-path: polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px);

    &__img {
        width: 20px;
        height: 20px;
        opacity: 0.55;
        transition: opacity 0.15s;
        filter: brightness(0) invert(1);
    }

    &__all {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.05em;
    }

    &:hover &__img,
    &--active &__img {
        opacity: 1;
    }

    &:hover {
        color: rgba(200, 134, 10, 0.8);
        border-color: rgba(200, 134, 10, 0.4);
        background: rgba(200, 134, 10, 0.05);
    }

    &--active {
        color: #C8860A !important;
        border-color: rgba(200, 134, 10, 0.6) !important;
        background: rgba(200, 134, 10, 0.1) !important;
    }
}

.search-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 8px;
}

.search-line {
    flex: 1;
    height: 1px;

    &--left {
        background: linear-gradient(to right, transparent, rgba(200, 134, 10, 0.25));
    }

    &--right {
        background: linear-gradient(to left, transparent, rgba(200, 134, 10, 0.25));
    }
}

.search-field {
    position: relative;
    flex-shrink: 0;
    width: 200px;
}

.search-icon {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    color: rgba(200, 134, 10, 0.6);
    pointer-events: none;
}

.search-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(139, 94, 60, 0.3);
    color: #C8860A;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    padding: 6px 10px 6px 28px;
    outline: none;
    transition: border-color 0.15s ease;

    &::placeholder {
        color: rgba(200, 134, 10, 0.4);
        letter-spacing: 0.12em;
    }

    &:focus {
        border-color: rgba(200, 134, 10, 0.5);
    }
}
</style>
