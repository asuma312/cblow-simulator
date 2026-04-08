import type { GameEvent, GameEventMeta, TeamState } from '@/types/game.types'
import { EARLY_TURNS, MID_TURNS, LATE_TURNS, LATE_TURN_WIN_REQ, LATE_SUB_ROLLS, LATE_SUB_WIN_REQ, DRAGON_BUFF, BARON_MULT } from './constants'
import { teamfightPower } from './state'

export function runLateGame(
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
