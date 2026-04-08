import type { ActionDefinition, ActionContext } from '@/types/game.types'
import { ROLE_POSITIONS, ROLE_LANE, LANE_TOWER_POSITIONS } from './constants'
import { getNextStep } from './pathfinding'

export type { ActionDefinition, ActionContext }

export const pushLane: ActionDefinition = {
    id: 'push_lane',
    getTargetPosition({ ps, role, side, enemyState }: ActionContext) {
        const lane = ROLE_LANE[role]
        if (!lane) return ROLE_POSITIONS[role][side]

        const enemySide = side === 'player' ? 'opponent' : 'player'
        const towers = LANE_TOWER_POSITIONS[enemySide][lane]
        const finalTarget = enemyState.towers[lane].outer > 0 ? towers.outer : towers.inner

        return getNextStep(ps.position, finalTarget)
    },
    shouldFight: () => true,
    shouldHitTower: () => true,
}

export const DEFAULT_ACTION = pushLane
