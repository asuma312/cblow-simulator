import type { Role } from '@/types/game.types'

export const TOTAL_TURNS = 60
export const DRAGON_TURNS = [20, 30, 40]
export const BARON_TURN = 45
export const RESPAWN = 2
export const TOWER_HITS = 3       // acertos para derrubar uma torre
export const TOWER_GOLD = 1000    // ouro ao atacante que derruba a torre
export const BOT_ADC_FARM_SHARE = 0.7
export const BOT_SUP_FARM_SHARE = 0.3

export const PLAYER_HP = 100
export const GOLD_PER_FARM = 15
export const KILL_GOLD         = 500
export const ASSIST_GOLD_SHARE = 0.5   // fração do kill gold para cada assister
export const ASSIST_WINDOW     = 5     // turnos anteriores que qualificam assist
export const REFERENCE_GOLD = 15000
export const GOLD_MULT_CAP = 1.3

export const BARON_MULT = 1.2
export const BARON_DURATION = 5
export const DRAGON_BUFF = 0.05

export const ROLE_WEIGHTS: Record<Role, { farm: number; mechanics: number; teamfight: number }> = {
    top:     { farm: 0.3,  mechanics: 0.4, teamfight: 0.3 },
    jungle:  { farm: 0.35, mechanics: 0.35, teamfight: 0.3 },
    mid:     { farm: 0.3,  mechanics: 0.4, teamfight: 0.3 },
    adc:     { farm: 0.4,  mechanics: 0.4, teamfight: 0.2 },
    support: { farm: 0.1,  mechanics: 0.3, teamfight: 0.6 },
}

export const ROLE_POSITIONS: Record<Role, { player: { x: number; y: number }; opponent: { x: number; y: number } }> = {
    top:     { player: { x: 35,  y: 75  }, opponent: { x: 80,  y: 35  } },
    jungle:  { player: { x: 89,  y: 210 }, opponent: { x: 366, y: 258 } },
    mid:     { player: { x: 206, y: 246 }, opponent: { x: 246, y: 219 } },
    adc:     { player: { x: 363, y: 424 }, opponent: { x: 435, y: 369 } },
    support: { player: { x: 392, y: 417 }, opponent: { x: 425, y: 395 } },
}

export const BASE_POSITIONS = {
    player:   { x: 0,   y: 468 },
    opponent: { x: 468, y: 0   },
} as const

export const COMBAT_RANGE = 40    // px
export const WALK_SPEED   = 80    // px/turno
export const DAMAGE_SCALE = 4     // multiplica damageRoll para acertar HP = 100

export const ROLE_LANE: Record<Role, 'top' | 'mid' | 'bot' | null> = {
    top: 'top', jungle: null, mid: 'mid', adc: 'bot', support: 'bot',
}

export const LANE_TOWER_POSITIONS: Record<
    'player' | 'opponent',
    Record<'top' | 'mid' | 'bot', { outer: { x: number; y: number }; inner: { x: number; y: number } }>
> = {
    player: {
        top: { outer: { x: 30,  y: 127 }, inner: { x: 47,  y: 296 } },
        mid: { outer: { x: 191, y: 284 }, inner: { x: 157, y: 341 } },
        bot: { outer: { x: 365, y: 461 }, inner: { x: 225, y: 458 } },
    },
    opponent: {
        top: { outer: { x: 123, y: 33  }, inner: { x: 278, y: 46  } },
        mid: { outer: { x: 285, y: 223 }, inner: { x: 333, y: 163 } },
        bot: { outer: { x: 464, y: 354 }, inner: { x: 455, y: 235 } },
    },
}

export function attackCooldown(mechanics: number): number {
    return Math.max(1, Math.round(10 / mechanics))
}
