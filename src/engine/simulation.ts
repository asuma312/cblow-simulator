import type {
    Player, Coach, GameResult, GameEvent, TeamGameStats,
    PlayerState, TeamState, CombatResult, GameEventMeta, GameEventType,
    PhaseResult, SimulationResult, Role,
} from '@/types/game.types'
import { ROLES } from '@/types/game.types'

// ─── Constants ───────────────────────────────────────────────────────────────

const EARLY_TURNS = 15
const MID_TURNS = 20
const LATE_TURNS = 10
const LATE_TURN_WIN_REQ = 3
const LATE_SUB_ROLLS = 5
const LATE_SUB_WIN_REQ = 3

const PLAYER_HP = 100
const GOLD_PER_FARM = 15
const KILL_GOLD = 500
const RESPAWN = 3
const REFERENCE_GOLD = 15000
const GOLD_MULT_CAP = 1.3

const BARON_MULT = 1.2
const BARON_DURATION = 5
const DRAGON_BUFF = 0.05

const MID_DRAGON_TURNS = [6, 13]
const MID_BARON_TURN = 18

const ROLE_WEIGHTS: Record<Role, { farm: number; mechanics: number; teamfight: number }> = {
    top:     { farm: 0.3,  mechanics: 0.4, teamfight: 0.3 },
    jungle:  { farm: 0.35, mechanics: 0.35, teamfight: 0.3 },
    mid:     { farm: 0.3,  mechanics: 0.4, teamfight: 0.3 },
    adc:     { farm: 0.4,  mechanics: 0.4, teamfight: 0.2 },
    support: { farm: 0.1,  mechanics: 0.3, teamfight: 0.6 },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
    return min + Math.random() * (max - min)
}

function randInt(min: number, max: number): number {
    return Math.floor(rand(min, max + 1))
}

function getKnowledge(p: Player, champId: string): number {
    return p.champPool.find(c => c.championId === champId)?.knowledge ?? 60
}

const FALLBACK_PLAYER: Player = {
    id: 'fallback', name: 'Unknown', nickname: '???', role: 'top',
    stats: { farm: 5, mechanics: 5, teamfight: 5 },
    champPool: [], popularity: 50, moral: 50, fatigue: 0,
}

function initTeamState(
    label: 'player' | 'opponent',
    roster: Player[],
    picks: Record<string, string>
): TeamState {
    const playerStates: PlayerState[] = ROLES.map(role => {
        const player = roster.find(p => p.role === role) ?? { ...FALLBACK_PLAYER, role }
        const champId = picks[role] ?? ''
        const knowledge = getKnowledge(player, champId)
        return {
            player,
            pickedChampionId: champId,
            gold: 0,
            hp: PLAYER_HP,
            deadUntilTurn: null,
            dragonStacks: 0,
            knowledgeMult: 0.5 + 0.5 * (knowledge / 100),
            fatigueMult: 1 - player.fatigue / 200,
            moralMult: 0.8 + player.moral / 500,
        }
    })
    return {
        label,
        playerStates,
        totalGold: 0,
        goldMultiplier: 1,
        dragonCount: 0,
        baronActive: false,
        baronTurnsRemaining: 0,
    }
}

function updateGoldMultiplier(team: TeamState): void {
    team.totalGold = team.playerStates.reduce((s, ps) => s + ps.gold, 0)
    team.goldMultiplier = Math.min(GOLD_MULT_CAP, 1 + (team.totalGold / REFERENCE_GOLD) * 0.3)
}

function farmTick(team: TeamState, turn: number): void {
    for (const ps of team.playerStates) {
        if (ps.deadUntilTurn !== null && turn < ps.deadUntilTurn) continue
        if (ps.deadUntilTurn !== null && turn >= ps.deadUntilTurn) {
            ps.deadUntilTurn = null
            ps.hp = PLAYER_HP
        }
        const w = ROLE_WEIGHTS[ps.player.role]
        const farmStat = ps.player.stats.farm * w.farm + ps.player.stats.mechanics * w.mechanics * 0.2
        ps.gold += farmStat * GOLD_PER_FARM * ps.knowledgeMult * ps.fatigueMult * ps.moralMult
    }
    updateGoldMultiplier(team)
}

function teamfightPower(team: TeamState, weightMechanics = 0.4, weightTeamfight = 0.6): number {
    const sum = team.playerStates.reduce((s, ps) => {
        const w = ROLE_WEIGHTS[ps.player.role]
        const base = ps.player.stats.mechanics * weightMechanics + ps.player.stats.teamfight * weightTeamfight
        return s + base * ps.knowledgeMult * ps.fatigueMult * ps.moralMult
    }, 0)
    return (sum / team.playerStates.length) * team.goldMultiplier * rand(0.85, 1.15)
}

// ─── Early Game ──────────────────────────────────────────────────────────────

function runEarlyGame(
    playerTeam: TeamState,
    opponentTeam: TeamState,
    coach: Coach | null | undefined,
    events: GameEvent[],
    metas: GameEventMeta[],
): { kills: { player: number; opponent: number } } {
    const kills = { player: 0, opponent: 0 }

    for (let turn = 1; turn <= EARLY_TURNS; turn++) {
        farmTick(playerTeam, turn)
        farmTick(opponentTeam, turn)

        const combats: CombatResult[] = []
        let turnAdvDelta = 0
        let hasKill = false

        for (let ri = 0; ri < ROLES.length; ri++) {
            const role = ROLES[ri]
            const atkP = playerTeam.playerStates[ri]
            const defP = opponentTeam.playerStates[ri]

            const pDead = atkP.deadUntilTurn !== null && turn < atkP.deadUntilTurn
            const oDead = defP.deadUntilTurn !== null && turn < defP.deadUntilTurn
            if (pDead || oDead) continue

            const w = ROLE_WEIGHTS[role]
            const rollPlayer = rand(0.5, 1.5) * (
                atkP.player.stats.mechanics * w.mechanics +
                atkP.player.stats.farm * w.farm
            ) * atkP.knowledgeMult * atkP.fatigueMult * atkP.moralMult

            const rollOpponent = rand(0.5, 1.5) * (
                defP.player.stats.mechanics * w.mechanics +
                defP.player.stats.farm * w.farm
            ) * defP.knowledgeMult * defP.fatigueMult * defP.moralMult

            const playerAttacks = rollPlayer > rollOpponent
            const attackerRoll = playerAttacks ? rollPlayer : rollOpponent
            const defenderRoll = playerAttacks ? rollOpponent : rollPlayer
            const damage = Math.max(0, (attackerRoll - defenderRoll) * 5)

            if (damage === 0) continue

            const attackerIsPlayer = playerAttacks
            const defenderState = playerAttacks ? defP : atkP
            defenderState.hp -= damage

            let killed = false
            let goldGained = 0
            if (defenderState.hp <= 0) {
                killed = true
                defenderState.deadUntilTurn = turn + RESPAWN
                defenderState.hp = PLAYER_HP
                const attackerState = playerAttacks ? atkP : defP
                attackerState.gold += KILL_GOLD
                goldGained = KILL_GOLD
                if (attackerIsPlayer) kills.player++
                else kills.opponent++
                hasKill = true
                const sign = attackerIsPlayer ? 1 : -1
                turnAdvDelta += sign * randInt(4, 8)
            }

            combats.push({
                attackerRole: role,
                defenderRole: role,
                attackerIsPlayer,
                damage,
                killedDefender: killed,
                goldGained,
            })
        }

        updateGoldMultiplier(playerTeam)
        updateGoldMultiplier(opponentTeam)

        const minute = turn * 2
        const type: GameEventType = hasKill ? 'kill' : 'turn_summary'
        const dominantKill = combats.find(c => c.killedDefender)

        let desc: string
        if (dominantKill) {
            const atkNick = dominantKill.attackerIsPlayer
                ? playerTeam.playerStates[ROLES.indexOf(dominantKill.attackerRole)].player.nickname
                : opponentTeam.playerStates[ROLES.indexOf(dominantKill.attackerRole)].player.nickname
            const defNick = dominantKill.attackerIsPlayer
                ? opponentTeam.playerStates[ROLES.indexOf(dominantKill.defenderRole)].player.nickname
                : playerTeam.playerStates[ROLES.indexOf(dominantKill.defenderRole)].player.nickname
            desc = dominantKill.attackerIsPlayer
                ? `${atkNick} abate ${defNick} na ${ROLES[ROLES.indexOf(dominantKill.attackerRole)].toUpperCase()} lane!`
                : `${atkNick} abate ${defNick} — pressão do adversário!`
        } else {
            desc = `Turno ${turn}: farm intenso, nenhum abate`
        }

        events.push({ minute, description: desc, advantageDelta: turnAdvDelta })
        metas.push({ type, phase: 'early', turnNumber: turn, combats })
    }

    return { kills }
}

// ─── Mid Game ────────────────────────────────────────────────────────────────

function runMidGame(
    playerTeam: TeamState,
    opponentTeam: TeamState,
    events: GameEvent[],
    metas: GameEventMeta[],
): { dragonWins: { player: number; opponent: number }; baronWinner: 'player' | 'opponent' | null } {
    const dragonWins = { player: 0, opponent: 0 }
    let baronWinner: 'player' | 'opponent' | null = null

    // Reset HP at mid-game start
    for (const ps of [...playerTeam.playerStates, ...opponentTeam.playerStates]) {
        ps.hp = PLAYER_HP
        ps.deadUntilTurn = null
    }

    for (let turn = 1; turn <= MID_TURNS; turn++) {
        farmTick(playerTeam, turn)
        farmTick(opponentTeam, turn)

        let minute = EARLY_TURNS * 2 + turn * 1.5

        // Dragon spawns
        if (MID_DRAGON_TURNS.includes(turn)) {
            const pPow = teamfightPower(playerTeam, 0.4, 0.6)
            const oPow = teamfightPower(opponentTeam, 0.4, 0.6)
            const winner: 'player' | 'opponent' = pPow >= oPow ? 'player' : 'opponent'
            const winTeam = winner === 'player' ? playerTeam : opponentTeam
            winTeam.dragonCount++
            for (const ps of winTeam.playerStates) ps.dragonStacks++

            if (winner === 'player') dragonWins.player++
            else dragonWins.opponent++

            const dragonNum = dragonWins.player + dragonWins.opponent
            const advDelta = winner === 'player' ? (dragonNum === 2 ? 12 : 8) : (dragonNum === 2 ? -12 : -8)
            const desc = winner === 'player'
                ? `Dragão ${dragonNum}! Seu time controla o objetivo.`
                : `Adversário pega o Dragão ${dragonNum}!`

            events.push({ minute: Math.round(minute), description: desc, advantageDelta: advDelta })
            metas.push({ type: 'dragon', phase: 'mid', turnNumber: turn, objectiveWinner: winner })
            continue
        }

        // Baron spawn
        if (turn === MID_BARON_TURN) {
            const pPow = teamfightPower(playerTeam, 0.3, 0.7)
            const oPow = teamfightPower(opponentTeam, 0.3, 0.7)
            baronWinner = pPow >= oPow ? 'player' : 'opponent'
            const winTeam = baronWinner === 'player' ? playerTeam : opponentTeam
            winTeam.baronActive = true
            winTeam.baronTurnsRemaining = BARON_DURATION

            const advDelta = baronWinner === 'player' ? 15 : -15
            const desc = baronWinner === 'player'
                ? `BARON! Seu time toma o Baron Nashor!`
                : `BARON! Adversário pega o Baron Nashor!`

            events.push({ minute: Math.round(minute), description: desc, advantageDelta: advDelta })
            metas.push({ type: 'baron', phase: 'mid', turnNumber: turn, objectiveWinner: baronWinner })
            continue
        }

        // Normal farm turn
        events.push({
            minute: Math.round(minute),
            description: `Mid game turno ${turn}: ambos os times empurram`,
            advantageDelta: 0,
        })
        metas.push({
            type: 'turn_summary', phase: 'mid', turnNumber: turn,
            goldSnapshot: { player: playerTeam.totalGold, opponent: opponentTeam.totalGold },
        })
    }

    return { dragonWins, baronWinner }
}

// ─── Late Game ───────────────────────────────────────────────────────────────

function runLateGame(
    playerTeam: TeamState,
    opponentTeam: TeamState,
    events: GameEvent[],
    metas: GameEventMeta[],
): 'player' | 'opponent' {
    let playerTurnsWon = 0
    let opponentTurnsWon = 0
    const baseMinute = EARLY_TURNS * 2 + MID_TURNS * 1.5

    for (let turn = 1; turn <= LATE_TURNS; turn++) {
        // Decrement baron
        for (const team of [playerTeam, opponentTeam]) {
            if (team.baronActive) {
                team.baronTurnsRemaining--
                if (team.baronTurnsRemaining <= 0) team.baronActive = false
            }
        }

        let playerSubWins = 0
        let opponentSubWins = 0

        for (let sub = 0; sub < LATE_SUB_ROLLS; sub++) {
            const dragonBuff = (stacks: number) => 1 + stacks * DRAGON_BUFF
            const baronBuff = (active: boolean) => active ? BARON_MULT : 1

            const pPow = teamfightPower(playerTeam, 0.5, 0.5)
                * dragonBuff(playerTeam.playerStates[0].dragonStacks)
                * baronBuff(playerTeam.baronActive)

            const oPow = teamfightPower(opponentTeam, 0.5, 0.5)
                * dragonBuff(opponentTeam.playerStates[0].dragonStacks)
                * baronBuff(opponentTeam.baronActive)

            if (pPow >= oPow) playerSubWins++
            else opponentSubWins++
        }

        const turnWinner: 'player' | 'opponent' = playerSubWins >= LATE_SUB_WIN_REQ ? 'player' : 'opponent'
        if (turnWinner === 'player') playerTurnsWon++
        else opponentTurnsWon++

        const advDelta = turnWinner === 'player' ? 10 : -10
        const minute = Math.round(baseMinute + turn * 2)
        const desc = turnWinner === 'player'
            ? `Teamfight ${turn}: seu time sai na frente! (${playerSubWins}/${LATE_SUB_ROLLS} sub-rolls)`
            : `Teamfight ${turn}: adversário vence a teamfight! (${opponentSubWins}/${LATE_SUB_ROLLS} sub-rolls)`

        events.push({ minute, description: desc, advantageDelta: advDelta })
        metas.push({
            type: 'late_turn_won',
            phase: 'late',
            turnNumber: turn,
            subRollWinner: turnWinner,
            lateTurnsWon: { player: playerTurnsWon, opponent: opponentTurnsWon },
        })

        if (playerTurnsWon >= LATE_TURN_WIN_REQ) return 'player'
        if (opponentTurnsWon >= LATE_TURN_WIN_REQ) return 'opponent'
    }

    // Tiebreak by turns won
    return playerTurnsWon >= opponentTurnsWon ? 'player' : 'opponent'
}

// ─── Stats generation ────────────────────────────────────────────────────────

function generateStats(power: number, isWinner: boolean): TeamGameStats {
    const base = power * 2
    return {
        kills:  Math.round(base * (0.8 + Math.random() * 0.4)) + (isWinner ? 3 : 0),
        deaths: Math.round(base * (0.5 + Math.random() * 0.5)) - (isWinner ? 2 : 0),
        gold:   Math.round(40000 + power * 3000 + Math.random() * 5000) + (isWinner ? 8000 : 0),
        towers: Math.floor(Math.random() * 5) + (isWinner ? 4 : 0),
    }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function simulateGame(
    playerRoster: Player[],
    opponentRoster: Player[],
    playerPicks: Record<string, string>,
    opponentPicks: Record<string, string>,
    coach?: Coach | null
): SimulationResult {
    const playerTeam = initTeamState('player', playerRoster, playerPicks)
    const opponentTeam = initTeamState('opponent', opponentRoster, opponentPicks)

    const events: GameEvent[] = []
    const metas: GameEventMeta[] = []
    const phases: PhaseResult[] = []

    // Phase headers
    function addPhaseHeader(phase: 'early' | 'mid' | 'late', label: string, minute: number) {
        events.push({ minute, description: `— ${label} —`, advantageDelta: 0 })
        metas.push({ type: 'phase_header', phase })
    }

    addPhaseHeader('early', 'EARLY GAME', 0)
    const { kills } = runEarlyGame(playerTeam, opponentTeam, coach, events, metas)
    phases.push({ phase: 'early' })

    addPhaseHeader('mid', 'MID GAME', EARLY_TURNS * 2 + 1)
    const { dragonWins, baronWinner } = runMidGame(playerTeam, opponentTeam, events, metas)
    phases.push({ phase: 'mid' })

    addPhaseHeader('late', 'LATE GAME', Math.round(EARLY_TURNS * 2 + MID_TURNS * 1.5) + 1)
    const winner = runLateGame(playerTeam, opponentTeam, events, metas)
    phases.push({ phase: 'late', winner })

    const playerPow = playerTeam.playerStates.reduce((s, ps) => {
        const w = ROLE_WEIGHTS[ps.player.role]
        return s + ps.player.stats.farm * w.farm + ps.player.stats.mechanics * w.mechanics + ps.player.stats.teamfight * w.teamfight
    }, 0) / playerTeam.playerStates.length

    const opponentPow = opponentTeam.playerStates.reduce((s, ps) => {
        const w = ROLE_WEIGHTS[ps.player.role]
        return s + ps.player.stats.farm * w.farm + ps.player.stats.mechanics * w.mechanics + ps.player.stats.teamfight * w.teamfight
    }, 0) / opponentTeam.playerStates.length

    return {
        winner,
        events,
        eventMeta: metas,
        phases,
        finalGold: { player: playerTeam.totalGold, opponent: opponentTeam.totalGold },
        finalKills: kills,
        dragonWins,
        baronWinner,
        stats: {
            player: generateStats(playerPow, winner === 'player'),
            opponent: generateStats(opponentPow, winner === 'opponent'),
        },
    }
}
