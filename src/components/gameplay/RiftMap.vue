<template>
    <div class="rift-map-wrapper">
        <div class="phase-badge">{{ turnLabel }}</div>

        <div v-if="dragMode" class="drag-mode-badge">
            🎯 DRAG MODE — arraste os ícones • <code>__debugMapPositions()</code> para sair
        </div>

        <div class="rift-map" ref="mapEl">
            <img src="/minimap.png" class="rift-bg-img" alt="Summoner's Rift" />

            <div class="objective baron-indicator" :style="{ background: baronBgColor }">
                <span class="obj-letter">B</span>
                <div v-if="baronWinner" class="obj-owned-dot" :class="`dot--${baronWinner}`"/>
            </div>

            <div class="objective dragon-indicator" :style="{ background: dragonBgColor }">
                <span class="obj-letter">D</span>
                <div class="dragon-stacks">
                    <span v-for="i in dragonWins.player"   :key="`dp${i}`" class="stack-dot stack-dot--player"/>
                    <span v-for="i in dragonWins.opponent" :key="`do${i}`" class="stack-dot stack-dot--opponent"/>
                </div>
            </div>

            <div
                v-for="tower in towerList"
                :key="tower.key"
                class="tower-icon"
                :class="[
                    tower.isPlayer ? 'tower--player' : 'tower--opponent',
                    { 'drag-enabled': dragMode, 'tower--destroyed': isTowerDestroyed(tower.key) }
                ]"
                :style="{ left: dp(tower.key, tower.x)[0] + 'px', top: dp(tower.key, tower.y)[1] + 'px' }"
                @mousedown="dragMode ? startDrag($event, tower.key, tower.x, tower.y) : undefined"
            >
                <svg class="tower-shape" viewBox="0 0 14 18" xmlns="http://www.w3.org/2000/svg" style="transform: scaleY(-1)">
                    <rect x="1" y="1" width="12" height="3" rx="1"/>
                    <rect x="4" y="4" width="6"  height="2"/>
                    <rect x="5" y="6" width="4"  height="7" rx="1"/>
                    <rect x="3" y="13" width="8" height="3" rx="1"/>
                    <rect x="4" y="15" width="6" height="2" rx="1"/>
                </svg>
                <div v-if="dragMode" class="drag-coords">{{ dp(tower.key, tower.x)[0] }}, {{ dp(tower.key, tower.y)[1] }}</div>
            </div>

            <div
                v-for="icon in championIcons"
                :key="icon.key"
                class="champ-icon-wrapper"
                :class="[icon.isPlayer ? 'is-player' : 'is-opponent', { 'is-dead': deadKeys.has(icon.key), 'drag-enabled': dragMode }]"
                :style="{
                    left: dp(icon.key, icon.x)[0] + 'px',
                    top:  dp(icon.key, icon.y)[1] + 'px',
                    transform: dragMode ? 'none' : icon.offset,
                }"
                @mousedown="dragMode ? startDrag($event, icon.key, icon.x, icon.y) : undefined"
            >
                <img
                    :src="`/champions/${icon.championId}.png`"
                    :alt="icon.championId"
                    class="champ-icon"
                    :class="{ 'flash-hit': flashKeys.has(icon.key), 'flash-kill': killKeys.has(icon.key) }"
                    @error="(e) => onIconError(e as Event)"
                />
                <div v-if="dragMode" class="drag-coords">{{ dp(icon.key, icon.x)[0] }}, {{ dp(icon.key, icon.y)[1] }}</div>
                <div v-if="!deadKeys.has(icon.key) && !dragMode" class="hp-bar">
                    <div class="hp-fill" :style="{ width: (hpMap[icon.key] ?? 100) + '%' }"/>
                </div>
                <div class="role-label">{{ icon.roleLabel }}</div>
            </div>
        </div>

        <div class="gold-display">
            <div class="gold-side">
                <span class="gold-icon">◆</span>
                <span class="gold-value">{{ formatGold(currentGold.player) }}</span>
                <span class="gold-label">Seu Time</span>
            </div>
            <div class="gold-side gold-side--opponent">
                <span class="gold-label">Adversário</span>
                <span class="gold-value">{{ formatGold(currentGold.opponent) }}</span>
                <span class="gold-icon">◆</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { GameEventMeta, TeamTowers } from '@/types/game.types'
import { ROLES, ROLE_SHORT_LABELS } from '@/types/game.types'
import { onIconError } from '@/utils/championImages'
import { TOTAL_TURNS, TOWER_HITS } from '@/engine/simulation/constants'

const props = defineProps<{
    currentTurnMeta: GameEventMeta | null
    playerPicks: string[]       // [top, jgl, mid, adc, sup]
    opponentPicks: string[]
    dragonWins: { player: number; opponent: number }
    baronWinner: 'player' | 'opponent' | null
    currentGold: { player: number; opponent: number }
    towerStates: { player: TeamTowers; opponent: TeamTowers }
}>()

// ─── Static position data ─────────────────────────────────────────────────────

const CHAMPION_POSITIONS: Record<string, { player: [number, number]; opponent: [number, number] }> = {
    top:     { player: [35,  75],  opponent: [80,  35]  },
    jungle:  { player: [89,  210], opponent: [366, 258] },
    mid:     { player: [206, 246], opponent: [246, 219] },
    adc:     { player: [363, 424], opponent: [435, 369] },
    support: { player: [392, 417], opponent: [425, 395] },
}

const TOWER_POSITIONS = {
    player: [
        { key: 'pt_top_out', x: 30,  y: 127 },
        { key: 'pt_top_inh', x: 47,  y: 296 },
        { key: 'pt_mid_out', x: 191, y: 284 },
        { key: 'pt_mid_inh', x: 157, y: 341 },
        { key: 'pt_bot_out', x: 365, y: 461 },
        { key: 'pt_bot_inh', x: 225, y: 458 },
    ],
    opponent: [
        { key: 'ot_top_out', x: 123, y: 33  },
        { key: 'ot_top_inh', x: 278, y: 46  },
        { key: 'ot_mid_out', x: 285, y: 223 },
        { key: 'ot_mid_inh', x: 333, y: 163 },
        { key: 'ot_bot_out', x: 464, y: 354 },
        { key: 'ot_bot_inh', x: 455, y: 235 },
    ],
}

const towerList = computed(() => [
    ...TOWER_POSITIONS.player.map(t   => ({ ...t, isPlayer: true  })),
    ...TOWER_POSITIONS.opponent.map(t => ({ ...t, isPlayer: false })),
])

// ─── Tower destroyed state ─────────────────────────────────────────────────────

const TOWER_KEY_MAP: Record<string, { side: 'player' | 'opponent'; lane: 'top' | 'mid' | 'bot'; which: 'outer' | 'inner' }> = {
    pt_top_out: { side: 'player',   lane: 'top', which: 'outer' },
    pt_top_inh: { side: 'player',   lane: 'top', which: 'inner' },
    pt_mid_out: { side: 'player',   lane: 'mid', which: 'outer' },
    pt_mid_inh: { side: 'player',   lane: 'mid', which: 'inner' },
    pt_bot_out: { side: 'player',   lane: 'bot', which: 'outer' },
    pt_bot_inh: { side: 'player',   lane: 'bot', which: 'inner' },
    ot_top_out: { side: 'opponent', lane: 'top', which: 'outer' },
    ot_top_inh: { side: 'opponent', lane: 'top', which: 'inner' },
    ot_mid_out: { side: 'opponent', lane: 'mid', which: 'outer' },
    ot_mid_inh: { side: 'opponent', lane: 'mid', which: 'inner' },
    ot_bot_out: { side: 'opponent', lane: 'bot', which: 'outer' },
    ot_bot_inh: { side: 'opponent', lane: 'bot', which: 'inner' },
}

function isTowerDestroyed(key: string): boolean {
    const info = TOWER_KEY_MAP[key]
    if (!info) return false
    const state = props.towerStates[info.side][info.lane][info.which]
    return state === 0
}

// ─── Champion icons ───────────────────────────────────────────────────────────

interface ChampIcon { key: string; championId: string; isPlayer: boolean; x: number; y: number; offset: string; roleLabel: string; role: string }

const championIcons = computed((): ChampIcon[] =>
    ROLES.flatMap((role, i) => {
        const pos = CHAMPION_POSITIONS[role]
        const base = { roleLabel: ROLE_SHORT_LABELS[role], role }
        return [
            { key: `player_${role}`,   championId: props.playerPicks[i]   ?? '', isPlayer: true,  x: pos.player[0],   y: pos.player[1],   offset: attackOffset(`player_${role}`),   ...base },
            { key: `opponent_${role}`, championId: props.opponentPicks[i] ?? '', isPlayer: false, x: pos.opponent[0], y: pos.opponent[1], offset: attackOffset(`opponent_${role}`), ...base },
        ]
    })
)

function attackOffset(key: string): string {
    const combats = props.currentTurnMeta?.combats
    if (!combats) return 'none'
    const isPlayer = key.startsWith('player_')
    const role = key.split('_')[1]
    const isAttacker = combats.some(c => c.attackerRole === role && c.attackerIsPlayer === isPlayer)
    return isAttacker ? `translate(${isPlayer ? 10 : -10}px, ${isPlayer ? -5 : 5}px)` : 'none'
}

// ─── Combat animations ────────────────────────────────────────────────────────

const flashKeys = ref(new Set<string>())
const killKeys  = ref(new Set<string>())
const deadKeys  = ref(new Set<string>())
const hpMap     = ref<Record<string, number>>({})

watch(() => props.currentTurnMeta, (meta) => {
    if (!meta?.combats?.length) return

    for (const c of meta.combats) {
        const defKey = c.attackerIsPlayer ? `opponent_${c.defenderRole}` : `player_${c.defenderRole}`

        if (c.killedDefender) {
            killKeys.value = new Set([...killKeys.value, defKey])
            setTimeout(() => { deadKeys.value = new Set([...deadKeys.value, defKey]); killKeys.value.delete(defKey) }, 450)
            setTimeout(() => { deadKeys.value.delete(defKey); hpMap.value[defKey] = 100 }, 2200)
        } else if (c.damage > 0) {
            flashKeys.value = new Set([...flashKeys.value, defKey])
            hpMap.value[defKey] = Math.max(0, (hpMap.value[defKey] ?? 100) - c.damage)
            setTimeout(() => flashKeys.value.delete(defKey), 280)
        }
    }
})

// ─── Turn badge ───────────────────────────────────────────────────────────────

const currentTurn = computed(() => props.currentTurnMeta?.turnNumber ?? 0)
const turnLabel   = computed(() => currentTurn.value > 0 ? `TURNO ${currentTurn.value} / ${TOTAL_TURNS}` : 'INICIANDO...')

const baronBgColor  = computed(() => props.baronWinner ? (props.baronWinner === 'player' ? '#818cf8' : '#f87171') : '#374151')
const dragonBgColor = computed(() => {
    const { player, opponent } = props.dragonWins
    if (!player && !opponent) return '#374151'
    return player > opponent ? '#1d4ed8' : '#b91c1c'
})

// ─── Drag mode ────────────────────────────────────────────────────────────────

const mapEl        = ref<HTMLElement>()
const dragMode     = ref(false)
const dragPositions = ref<Record<string, [number, number]>>({})
let dragging: { key: string; startMouseX: number; startMouseY: number; startX: number; startY: number } | null = null

function dp(key: string, base: number): [number, number] {
    const cached = dragPositions.value[key]
    return cached ? cached : [base, base]
}

function startDrag(e: MouseEvent, key: string, baseX: number, baseY: number) {
    e.preventDefault()
    const [x, y] = dragPositions.value[key] ?? [baseX, baseY]
    dragging = { key, startMouseX: e.clientX, startMouseY: e.clientY, startX: x, startY: y }
}

function onMouseMove(e: MouseEvent) {
    if (!dragging) return
    dragPositions.value[dragging.key] = [
        Math.round(dragging.startX + e.clientX - dragging.startMouseX),
        Math.round(dragging.startY + e.clientY - dragging.startMouseY),
    ]
}

function onMouseUp() {
    if (!dragging) return
    const pos = dragPositions.value[dragging.key]
    if (pos) {
        const [side, role] = dragging.key.split('_')
        console.log(`%c${side} ${role}:%c ${pos[0]}, ${pos[1]}`, 'color:#C8860A;font-weight:bold', 'color:#22d3ee')
    }
    dragging = null
}

function logAllPositions() {
    console.group('%c[RiftMap] campeões', 'color:#C8860A;font-weight:bold')
    for (const role of ROLES) {
        const ref = CHAMPION_POSITIONS[role]
        const [px, py] = dragPositions.value[`player_${role}`]   ?? ref.player
        const [ox, oy] = dragPositions.value[`opponent_${role}`] ?? ref.opponent
        console.log(`  ${role.padEnd(7)}: { player: [${px}, ${py}], opponent: [${ox}, ${oy}] },`)
    }
    console.groupEnd()
    console.group('%c[RiftMap] torres', 'color:#C8860A;font-weight:bold')
    for (const t of [...TOWER_POSITIONS.player, ...TOWER_POSITIONS.opponent]) {
        const [x, y] = dragPositions.value[t.key] ?? [t.x, t.y]
        console.log(`  { key: '${t.key}', x: ${x}, y: ${y} },`)
    }
    console.groupEnd()
}

onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    ;(window as unknown as Record<string, unknown>).__debugMapPositions = () => {
        dragMode.value = !dragMode.value
        if (dragMode.value) console.log('%c[RiftMap] Drag mode ON', 'color:#22d3ee')
        else logAllPositions()
    }
})

onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
})

function formatGold(gold: number): string {
    return gold >= 1000 ? (gold / 1000).toFixed(1) + 'k' : Math.round(gold).toString()
}
</script>

<style lang="scss" scoped>
.rift-map-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    user-select: none;
}

.phase-badge {
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    padding: 5px 14px;
    border-radius: 2px;
    width: fit-content;
    margin: 0 auto;
    text-transform: uppercase;
    background: rgba(139, 94, 60, 0.25);
    color: #C8860A;
    border: 1px solid rgba(139, 94, 60, 0.5);
}

.rift-map {
    position: relative;
    width: 500px;
    height: 500px;
    flex-shrink: 0;
    border: 1px solid rgba(139, 94, 60, 0.4);
    overflow: hidden;
}

.rift-bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
}

.objective {
    position: absolute;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    border: 2px solid rgba(255,255,255,0.25);
    box-shadow: 0 0 8px currentColor;
    transition: background 0.4s ease;
}

.baron-indicator  { left: 155px; top: 170px; }
.dragon-indicator { left: 330px; top: 315px; flex-direction: column; gap: 2px; }

.obj-letter {
    font-size: 13px;
    font-weight: 800;
    color: white;
    font-family: monospace;
    line-height: 1;
}

.obj-owned-dot {
    position: absolute;
    top: -4px; right: -4px;
    width: 10px; height: 10px;
    border-radius: 50%;
    border: 1.5px solid rgba(0,0,0,0.5);
    &.dot--player   { background: #4a9eff; }
    &.dot--opponent { background: #ff4a4a; }
}

.dragon-stacks {
    display: flex;
    gap: 3px;
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
}

.stack-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.4);
    &--player   { background: #4a9eff; }
    &--opponent { background: #ff4a4a; }
}

.tower-icon {
    position: absolute;
    z-index: 8;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease, filter 0.3s ease;
}

.tower--destroyed {
    opacity: 0.15;
    filter: grayscale(1);
}

.tower-shape {
    width: 14px;
    height: 18px;
    filter: drop-shadow(0 0 3px currentColor);
    rect { stroke: rgba(0,0,0,0.6); stroke-width: 0.5; }
    .tower--player &  { color: #4a9eff; rect { fill: #4ac8ff; } }
    .tower--opponent & { color: #ff4a4a; rect { fill: #ff6666; } }
}

.champ-icon-wrapper {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    transition: transform 150ms ease;
    z-index: 10;
    &.is-dead { opacity: 0.35; filter: grayscale(1) brightness(0.3); }
}

.champ-icon {
    width: 36px; height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #4a9eff;
    transition: filter 80ms ease;
    .is-opponent & { border-color: #ff4a4a; }
    &.flash-hit  { animation: flash-hit  280ms ease; }
    &.flash-kill { animation: flash-kill 450ms ease forwards; }
}

@keyframes flash-hit {
    0%   { filter: brightness(1); }
    40%  { filter: brightness(0.1) sepia(1) saturate(8) hue-rotate(320deg); }
    100% { filter: brightness(1); }
}

@keyframes flash-kill {
    0%   { filter: brightness(1); transform: scale(1); }
    40%  { filter: brightness(0) sepia(1) saturate(10) hue-rotate(320deg); transform: scale(0.8); }
    100% { filter: grayscale(1) brightness(0.3); transform: scale(0.7); }
}

.hp-bar {
    width: 36px; height: 4px;
    background: rgba(0,0,0,0.5);
    border-radius: 2px;
    .hp-fill { height: 100%; background: #22c55e; border-radius: 2px; transition: width 300ms ease; }
}

.role-label {
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: rgba(245, 240, 232, 0.6);
}

.drag-enabled {
    cursor: grab;
    z-index: 50 !important;
    &:active { cursor: grabbing; }
}

.drag-coords {
    position: absolute;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.85);
    color: #22d3ee;
    font-size: 10px;
    font-family: monospace;
    padding: 2px 5px;
    border-radius: 3px;
    white-space: nowrap;
    pointer-events: none;
    border: 1px solid rgba(34, 211, 238, 0.3);
}

.drag-mode-badge {
    text-align: center;
    font-size: 11px;
    padding: 5px 10px;
    background: rgba(234, 179, 8, 0.15);
    border: 1px solid rgba(234, 179, 8, 0.5);
    color: #fbbf24;
    letter-spacing: 0.04em;
    code { font-family: monospace; color: #22d3ee; font-size: 10px; }
}

.gold-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(139, 94, 60, 0.3);
    padding: 8px 12px;
    font-size: 13px;
}

.gold-side {
    display: flex;
    align-items: center;
    gap: 6px;
    &--opponent { flex-direction: row-reverse; }
}

.gold-icon  { font-size: 10px; color: #fbbf24; }
.gold-value { font-weight: 700; font-size: 15px; color: #fbbf24; letter-spacing: 0.05em; }
.gold-label { font-size: 10px; color: rgba(245, 240, 232, 0.4); letter-spacing: 0.06em; text-transform: uppercase; }
</style>
