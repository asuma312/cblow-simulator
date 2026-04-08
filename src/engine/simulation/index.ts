import type {
    Player, Coach, GameEvent, GameEventMeta, SimulationResult, ActionContext,
    TeamState, PlayerState, CombatResult, TeamTowers,
} from '@/types/game.types'
import {
    TOTAL_TURNS, DRAGON_TURNS, BARON_TURN, BARON_DURATION,
    TOWER_GOLD, KILL_GOLD, ASSIST_GOLD_SHARE, ASSIST_WINDOW, PLAYER_HP, RESPAWN,
    ROLE_WEIGHTS, BASE_POSITIONS, COMBAT_RANGE, WALK_SPEED, DAMAGE_SCALE,
    ROLE_LANE, LANE_TOWER_POSITIONS, attackCooldown,
} from './constants'
import { rand, randInt, stepToward } from './helpers'
import { initTeamState, farmTick, teamfightPower, updateGoldMultiplier } from './state'
import { getMatchupMult } from './matchups'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const alive = (ps: PlayerState): boolean => ps.deadUntilTurn === null

type Pos = { x: number; y: number }

function dist(a: Pos, b: Pos): number {
    const dx = b.x - a.x, dy = b.y - a.y
    return Math.sqrt(dx * dx + dy * dy)
}

function withinRange(a: Pos, b: Pos): boolean {
    return dist(a, b) <= COMBAT_RANGE
}

function nearestAlive(ps: PlayerState, enemies: PlayerState[]): { unit: PlayerState; d: number } | null {
    let best: { unit: PlayerState; d: number } | null = null
    for (const e of enemies) {
        if (!alive(e)) continue
        const d = dist(ps.position, e.position)
        if (!best || d < best.d) best = { unit: e, d }
    }
    return best
}

function activeTowerPos(defTeam: TeamState, lane: 'top' | 'mid' | 'bot'): Pos {
    const ls    = defTeam.towers[lane]
    const side  = defTeam.label
    return ls.outer > 0
        ? LANE_TOWER_POSITIONS[side][lane].outer
        : LANE_TOWER_POSITIONS[side][lane].inner
}

function makeCtx(
    ps: PlayerState,
    side: 'player' | 'opponent',
    turn: number,
    playerTeam: TeamState,
    opponentTeam: TeamState,
): ActionContext {
    return {
        ps, role: ps.player.role, side, turn,
        allyState:  side === 'player' ? playerTeam   : opponentTeam,
        enemyState: side === 'player' ? opponentTeam : playerTeam,
        allUnits: { player: playerTeam.playerStates, opponent: opponentTeam.playerStates },
    }
}

function snapshotTowers(p: TeamState, o: TeamState): { player: TeamTowers; opponent: TeamTowers } {
    const snap = (t: TeamState): TeamTowers => ({
        top: { ...t.towers.top }, mid: { ...t.towers.mid }, bot: { ...t.towers.bot },
    })
    return { player: snap(p), opponent: snap(o) }
}

function snapshotPositions(p: TeamState, o: TeamState) {
    return {
        player:   p.playerStates.map(ps => ({ ...ps.position })),
        opponent: o.playerStates.map(ps => ({ ...ps.position })),
    }
}

function hitTower(
    attackerPs: PlayerState,
    defendingTeam: TeamState,
    lane: 'top' | 'mid' | 'bot',
): { destroyed: boolean; whichTower: 'outer' | 'inner' } {
    const ls = defendingTeam.towers[lane]
    if (ls.outer > 0) {
        ls.outer--
        if (ls.outer === 0) attackerPs.gold += TOWER_GOLD
        return { destroyed: ls.outer === 0, whichTower: 'outer' }
    } else if (ls.inner > 0) {
        ls.inner--
        if (ls.inner === 0) attackerPs.gold += TOWER_GOLD
        return { destroyed: ls.inner === 0, whichTower: 'inner' }
    }
    return { destroyed: false, whichTower: 'outer' }
}

function countDestroyedTowers(team: TeamState): number {
    return (['top', 'mid', 'bot'] as const).reduce((n, lane) =>
        n + (team.towers[lane].outer === 0 ? 1 : 0) + (team.towers[lane].inner === 0 ? 1 : 0), 0)
}

function damageRoll(ps: PlayerState, targetPs: PlayerState): number {
    const w = ROLE_WEIGHTS[ps.player.role]
    return rand(0.5, 1.5)
        * (ps.player.stats.farm * w.farm + ps.player.stats.teamfight * w.teamfight)
        * ps.knowledgeMult * ps.fatigueMult * ps.moralMult
        * getMatchupMult(ps.pickedChampionId, ps.player.role, targetPs.pickedChampionId)
}

function tfWinner(
    playerTeam: TeamState, opponentTeam: TeamState,
    wM: number, wT: number,
): 'player' | 'opponent' {
    return teamfightPower(playerTeam, wM, wT) >= teamfightPower(opponentTeam, wM, wT)
        ? 'player' : 'opponent'
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function simulateGame(
    playerRoster: Player[],
    opponentRoster: Player[],
    playerPicks: Record<string, string>,
    opponentPicks: Record<string, string>,
    _coach?: Coach | null,
): SimulationResult {
    const playerTeam   = initTeamState('player',   playerRoster,   playerPicks)
    const opponentTeam = initTeamState('opponent', opponentRoster, opponentPicks)

    const events: GameEvent[]    = []
    const metas: GameEventMeta[] = []

    let finalWinner: 'player' | 'opponent' = 'player'
    let nexusDestroyed = false
    const killCount  = { player: 0, opponent: 0 }
    const dragonWins = { player: 0, opponent: 0 }
    let baronWinner: 'player' | 'opponent' | null = null

    const damageLog = new Map<PlayerState, { attackerPs: PlayerState; turn: number }[]>()

    function addEvent(
        type: GameEventMeta['type'],
        description: string,
        advantageDelta: number,
        turn: number,
        combats: CombatResult[] = [],
    ): void {
        events.push({ minute: turn, description, advantageDelta })
        metas.push({
            type, phase: 'game', turnNumber: turn, combats,
            towerSnapshot:    snapshotTowers(playerTeam, opponentTeam),
            goldSnapshot:     { player: playerTeam.totalGold, opponent: opponentTeam.totalGold },
            positionSnapshot: snapshotPositions(playerTeam, opponentTeam),
        })
    }

    function resolveKill(killerPs: PlayerState, victimPs: PlayerState, turn: number, killerIsPlayer: boolean): void {
        killerPs.gold += KILL_GOLD

        const assistGold = Math.floor(KILL_GOLD * ASSIST_GOLD_SHARE)
        const assisters  = new Set(
            (damageLog.get(victimPs) ?? [])
                .filter(e => e.turn >= turn - ASSIST_WINDOW && e.attackerPs !== killerPs)
                .map(e => e.attackerPs)
        )
        for (const a of assisters) a.gold += assistGold
        damageLog.delete(victimPs)

        victimPs.deadUntilTurn = turn + RESPAWN
        victimPs.hp            = PLAYER_HP
        victimPs.position      = { ...BASE_POSITIONS[killerIsPlayer ? 'opponent' : 'player'] }
        victimPs.atkCooldown   = attackCooldown(victimPs.player.stats.mechanics)
        if (killerIsPlayer) killCount.player++
        else killCount.opponent++
    }

    const sides = [['player', playerTeam, opponentTeam], ['opponent', opponentTeam, playerTeam]] as const

    for (let turn = 1; turn <= TOTAL_TURNS; turn++) {
        farmTick(playerTeam, turn)
        farmTick(opponentTeam, turn)

        // ── Step posições ──────────────────────────────────────────────────
        for (const [side, team, enemyTeam] of sides) {
            for (const ps of team.playerStates) {
                if (!alive(ps)) continue
                const ctx = makeCtx(ps, side, turn, playerTeam, opponentTeam)

                if (ps.currentAction.shouldFight(ctx)) {
                    const near = nearestAlive(ps, enemyTeam.playerStates)
                    if (near) {
                        if (near.d <= COMBAT_RANGE) continue
                        if (near.d <= WALK_SPEED + COMBAT_RANGE) {
                            const moveBy = near.d - COMBAT_RANGE
                            const dx = near.unit.position.x - ps.position.x
                            const dy = near.unit.position.y - ps.position.y
                            ps.position = {
                                x: ps.position.x + dx / near.d * moveBy,
                                y: ps.position.y + dy / near.d * moveBy,
                            }
                            continue
                        }
                    }
                }

                ps.position = stepToward(ps.position, ps.currentAction.getTargetPosition(ctx), WALK_SPEED)
            }
        }

        // ── Decrement cooldowns ────────────────────────────────────────────
        const allPs = [...playerTeam.playerStates, ...opponentTeam.playerStates]
        for (const ps of allPs) {
            if (alive(ps) && ps.atkCooldown > 0) ps.atkCooldown--
        }

        const combats: CombatResult[] = []
        let turnAdvDelta = 0
        let hasKill = false
        let hasTowerDestroyed = false
        let killDesc = ''
        let towerDesc = ''

        // ── Combate unificado: campeões (prioridade) ou torre ─────────────
        for (const [side, team, enemyTeam] of sides) {
            const sign = side === 'player' ? 1 : -1
            for (const atkPs of team.playerStates) {
                if (!alive(atkPs) || atkPs.atkCooldown > 0) continue
                const ctx = makeCtx(atkPs, side, turn, playerTeam, opponentTeam)

                // Prioridade 1: campeão inimigo no range
                const inRangeEnemies = atkPs.currentAction.shouldFight(ctx)
                    ? enemyTeam.playerStates.filter(e => alive(e) && withinRange(atkPs.position, e.position))
                    : []

                if (inRangeEnemies.length) {
                    const targetPs = inRangeEnemies[randInt(0, inRangeEnemies.length - 1)]
                    atkPs.atkCooldown = attackCooldown(atkPs.player.stats.mechanics)

                    const damage = damageRoll(atkPs, targetPs) * DAMAGE_SCALE
                    targetPs.hp -= damage

                    let killed = false
                    let goldGained = 0
                    if (targetPs.hp <= 0) {
                        resolveKill(atkPs, targetPs, turn, side === 'player')
                        goldGained = KILL_GOLD
                        killed = true
                        hasKill = true
                        turnAdvDelta += sign * randInt(4, 8)
                        killDesc = side === 'player'
                            ? `${atkPs.player.nickname} abate ${targetPs.player.nickname}!`
                            : `${atkPs.player.nickname} abate ${targetPs.player.nickname} — pressão do adversário!`
                    } else {
                        const log = damageLog.get(targetPs) ?? []
                        log.push({ attackerPs: atkPs, turn })
                        damageLog.set(targetPs, log)
                    }
                    combats.push({
                        attackerRole: atkPs.player.role, defenderRole: targetPs.player.role,
                        attackerIsPlayer: side === 'player', damage, killedDefender: killed, goldGained,
                    })
                    continue
                }

                // Prioridade 2: torre inimiga no range
                if (!atkPs.currentAction.shouldHitTower(ctx)) continue
                const lane = ROLE_LANE[atkPs.player.role]
                if (!lane) continue
                const tPos = activeTowerPos(enemyTeam, lane)
                if (!withinRange(atkPs.position, tPos)) continue

                atkPs.atkCooldown = attackCooldown(atkPs.player.stats.mechanics)
                const r = hitTower(atkPs, enemyTeam, lane)
                if (r.destroyed) {
                    hasTowerDestroyed = true
                    if (!towerDesc) towerDesc = side === 'player'
                        ? `TORRE DESTRUÍDA! ${atkPs.player.nickname} derruba a ${r.whichTower === 'outer' ? 'torre externa' : 'torre interna'} da ${lane.toUpperCase()}!`
                        : `TORRE DESTRUÍDA! Adversário derruba a ${r.whichTower === 'outer' ? 'torre externa' : 'torre interna'} da ${lane.toUpperCase()}!`
                    turnAdvDelta += sign * 12
                }
            }
        }

        updateGoldMultiplier(playerTeam)
        updateGoldMultiplier(opponentTeam)

        // ── Vitória por torres ─────────────────────────────────────────────
        if (countDestroyedTowers(opponentTeam) === 6) {
            finalWinner = 'player'; nexusDestroyed = true
            addEvent('tower_destroyed', `Turno ${turn}: NEXUS! Seu time destrói todas as torres!`, 20, turn, combats)
            break
        }
        if (countDestroyedTowers(playerTeam) === 6) {
            finalWinner = 'opponent'; nexusDestroyed = true
            addEvent('tower_destroyed', `Turno ${turn}: NEXUS! Adversário destrói todas as torres!`, -20, turn, combats)
            break
        }

        // ── Objetivos ──────────────────────────────────────────────────────
        if (DRAGON_TURNS.includes(turn)) {
            const winner  = tfWinner(playerTeam, opponentTeam, 0.4, 0.6)
            const winTeam = winner === 'player' ? playerTeam : opponentTeam
            winTeam.dragonCount++
            for (const p of winTeam.playerStates) p.dragonStacks++
            dragonWins[winner]++
            const n        = dragonWins.player + dragonWins.opponent
            const advDelta = (winner === 'player' ? 1 : -1) * (n === 2 ? 12 : 8)
            addEvent('dragon', winner === 'player'
                ? `Dragão ${n}! Seu time controla o objetivo.`
                : `Adversário pega o Dragão ${n}!`,
                advDelta, turn)
            continue
        }

        if (turn === BARON_TURN) {
            baronWinner = tfWinner(playerTeam, opponentTeam, 0.3, 0.7)
            for (const p of (baronWinner === 'player' ? playerTeam : opponentTeam).playerStates) {
                p.baronActive = true
                p.baronTurnsRemaining = BARON_DURATION
            }
            addEvent('baron', baronWinner === 'player'
                ? `BARON! Seu time toma o Baron Nashor!`
                : `BARON! Adversário pega o Baron Nashor!`,
                baronWinner === 'player' ? 15 : -15, turn)
            continue
        }

        // ── Decrement barão ────────────────────────────────────────────────
        for (const p of allPs) {
            if (p.baronActive && --p.baronTurnsRemaining <= 0) p.baronActive = false
        }

        // ── Evento do turno ────────────────────────────────────────────────
        if (hasTowerDestroyed)   addEvent('tower_destroyed', towerDesc, turnAdvDelta, turn, combats)
        else if (hasKill)        addEvent('kill',            killDesc,  turnAdvDelta, turn, combats)
        else                     addEvent('turn_summary', `Turno ${turn}: farm intenso, nenhum abate`, 0, turn, combats)
    }

    // ── Vencedor pós-60 ───────────────────────────────────────────────────────
    if (!nexusDestroyed) {
        const pD = countDestroyedTowers(opponentTeam)
        const oD = countDestroyedTowers(playerTeam)
        finalWinner = pD !== oD
            ? (pD > oD ? 'player' : 'opponent')
            : (playerTeam.totalGold >= opponentTeam.totalGold ? 'player' : 'opponent')
    }

    return {
        winner: finalWinner,
        events,
        eventMeta: metas,
        finalGold:   { player: playerTeam.totalGold,   opponent: opponentTeam.totalGold },
        finalKills:  killCount,
        dragonWins,
        baronWinner,
        finalTowers: snapshotTowers(playerTeam, opponentTeam),
        stats: {
            player:   { kills: killCount.player,   deaths: killCount.opponent, gold: Math.round(playerTeam.totalGold),   towers: countDestroyedTowers(opponentTeam) },
            opponent: { kills: killCount.opponent, deaths: killCount.player,   gold: Math.round(opponentTeam.totalGold), towers: countDestroyedTowers(playerTeam)   },
        },
    }
}
