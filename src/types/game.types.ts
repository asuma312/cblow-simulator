export type ChampionPosition = 'Top' | 'Jungle' | 'Mid' | 'Bottom' | 'Support'

export interface Champion {
    id: string                    // DDragon name — usado para imagem e champPool
    name: string                  // nome de exibição
    positions: ChampionPosition[]
    matchups?: Record<string, Record<string, number>>  // role -> opponentName -> winRate
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

// ─── Simulation types ────────────────────────────────────────────────────────

export interface TowerLaneState {
    outer: number  // hits restantes (0 = destruída)
    inner: number
}

export interface TeamTowers {
    top: TowerLaneState
    mid: TowerLaneState
    bot: TowerLaneState
}

export interface PlayerState {
    player: Player
    pickedChampionId: string
    gold: number
    hp: number              // starts at 100
    deadUntilTurn: number | null
    dragonStacks: number
    baronActive: boolean
    baronTurnsRemaining: number
    knowledgeMult: number   // 0.5 + 0.5 * (knowledge/100)
    fatigueMult: number     // 1 - fatigue/200
    moralMult: number       // 0.8 + moral/500
}

export interface TeamState {
    label: 'player' | 'opponent'
    playerStates: PlayerState[]  // index = top/jgl/mid/adc/sup
    totalGold: number
    goldMultiplier: number       // 1 + (totalGold/15000) * 0.3, max 1.3
    dragonCount: number
    towers: TeamTowers
}

export interface CombatResult {
    attackerRole: Role
    defenderRole: Role
    attackerIsPlayer: boolean
    damage: number
    killedDefender: boolean
    goldGained: number
    counterDamage?: number       // dano sofrido pelo attacker (vencedor), só presente se loser sobreviveu
    assistantRole?: Role
    assistantIsPlayer?: boolean
    assistGoldGained?: number
}

export type GameEventType =
    | 'turn_summary' | 'kill' | 'survive'
    | 'dragon' | 'baron' | 'teamfight' | 'gold_update'
    | 'tower_hit' | 'tower_destroyed'

export interface GameEventMeta {
    type: GameEventType
    phase: 'game'
    turnNumber?: number
    combats?: CombatResult[]
    objectiveWinner?: 'player' | 'opponent'
    towerSnapshot?: { player: TeamTowers; opponent: TeamTowers }
    goldSnapshot?: { player: number; opponent: number }
}

export interface SimulationResult extends GameResult {
    eventMeta: GameEventMeta[]
    finalGold: { player: number; opponent: number }
    finalKills: { player: number; opponent: number }
    dragonWins: { player: number; opponent: number }
    baronWinner: 'player' | 'opponent' | null
    finalTowers: { player: TeamTowers; opponent: TeamTowers }
}
