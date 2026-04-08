import type { Role } from '@/types/game.types'

export const EARLY_TURNS = 15
export const MID_TURNS = 20
export const LATE_TURNS = 10
export const LATE_TURN_WIN_REQ = 3
export const LATE_SUB_ROLLS = 5
export const LATE_SUB_WIN_REQ = 3

export const PLAYER_HP = 100
export const GOLD_PER_FARM = 15
export const KILL_GOLD = 500
export const RESPAWN = 3
export const REFERENCE_GOLD = 15000
export const GOLD_MULT_CAP = 1.3

export const BARON_MULT = 1.2
export const BARON_DURATION = 5
export const DRAGON_BUFF = 0.05

export const MID_DRAGON_TURNS = [6, 13]
export const MID_BARON_TURN = 18

export const ROLE_WEIGHTS: Record<Role, { farm: number; mechanics: number; teamfight: number }> = {
    top:     { farm: 0.3,  mechanics: 0.4, teamfight: 0.3 },
    jungle:  { farm: 0.35, mechanics: 0.35, teamfight: 0.3 },
    mid:     { farm: 0.3,  mechanics: 0.4, teamfight: 0.3 },
    adc:     { farm: 0.4,  mechanics: 0.4, teamfight: 0.2 },
    support: { farm: 0.1,  mechanics: 0.3, teamfight: 0.6 },
}
