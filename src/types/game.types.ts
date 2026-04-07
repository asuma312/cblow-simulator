export type ChampionPosition = 'Top' | 'Jungle' | 'Mid' | 'Bottom' | 'Support'

export interface Champion {
    id: string                    // DDragon name — usado para imagem e champPool
    name: string                  // nome de exibição
    positions: ChampionPosition[]
}

export const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'] as const
export type Role = typeof ROLES[number]

export const ROLE_LABELS: Record<Role, string> = {
    top: 'Top', jungle: 'Jungle', mid: 'Mid', adc: 'ADC', support: 'Suporte',
}

export const ROLE_SHORT_LABELS: Record<Role, string> = {
    top: 'TOP', jungle: 'JGL', mid: 'MID', adc: 'ADC', support: 'SUP',
}

export interface PlayerStats {
    farm: number      // 1-10
    mechanics: number // 1-10
    teamfight: number // 1-10
}

export interface ChampionKnowledge {
    championId: string
    knowledge: number // 0-100
}

export interface Player {
    id: string
    name: string
    nickname: string
    role: Role
    stats: PlayerStats
    champPool: ChampionKnowledge[]
    popularity: number    // 0-100
    moral: number         // 0-100
    fatigue: number       // 0-100
}

export interface Coach {
    id: string
    name: string
    focus: string
    description: string
    bonus: CoachBonus
}

export interface CoachBonus {
    teamfightMultiplier?: number    // e.g. 1.15
    mechanicsTrainBonus?: number    // e.g. 0.1
    farmEarlyBonus?: number         // e.g. 1.15
    moralDecayReduction?: number    // e.g. 0.3
}

export interface AITeam {
    id: string
    name: string
    archetype: string
    roster: Player[]
    preferredPlayerIds: string[]  // IDs em ordem top/jg/mid/adc/sup
}

export type TrainingActionType =
    | { type: 'trainFarm' }
    | { type: 'trainMechanics' }
    | { type: 'trainTeamfight' }
    | { type: 'studyChampion'; championId: string }
    | { type: 'stream' }
    | { type: 'rest' }

export type TrainingAction = TrainingActionType

export interface WeeklyPlan {
    [playerId: string]: TrainingAction
}

export type MatchFormat = 'bo3' | 'bo5'

export interface Match {
    id: string
    teamA: string  // team id
    teamB: string  // team id
    winner?: string
    format: MatchFormat
    bracket: 'winners' | 'losers' | 'grand_final'
    round: number
}

export interface TournamentState {
    matches: Match[]
    currentMatchId: string | null
    playerTeamId: string
    eliminated: string[]
    week: number
}

export interface GameState {
    phase: 'setup' | 'training' | 'champselect' | 'gameplay' | 'tournament' | 'gameover' | 'victory'
    budget: number
    week: number
    currentMatchId: string | null
    currentGameInSeries: number
    seriesScores: { player: number; opponent: number }
}

export interface DraftResult {
    blue: { top: string; jungle: string; mid: string; adc: string; support: string }
    red:  { top: string; jungle: string; mid: string; adc: string; support: string }
}

export interface GameResult {
    winner: 'player' | 'opponent'
    events: GameEvent[]
    stats: { player: TeamGameStats; opponent: TeamGameStats }
}

export interface GameEvent {
    minute: number
    description: string
    advantageDelta: number
}

export interface TeamGameStats {
    kills: number
    deaths: number
    gold: number
    towers: number
}
