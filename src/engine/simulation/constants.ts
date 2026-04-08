import type { Role } from '@/types/game.types'

export const TOTAL_TURNS = 60
export const DRAGON_TURNS = [20, 30, 40]
export const BARON_TURN = 45
export const RESPAWN = 2
export const TOWER_HITS = 3       // acertos para derrubar uma torre
export const TOWER_GOLD = 1000    // ouro ao atacante que derruba a torre
export const BOT_ADC_FARM_SHARE = 0.7
export const BOT_SUP_FARM_SHARE = 0.3
export const ASSIST_GOLD_SHARE = 0.5

export const PLAYER_HP = 100
export const GOLD_PER_FARM = 15
export const KILL_GOLD = 500
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
