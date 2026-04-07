import type { Player, Coach, GameResult, GameEvent, TeamGameStats } from '@/types/game.types'

const ROLE_WEIGHTS = {
    top:     { farm: 0.3,  mechanics: 0.4, teamfight: 0.3 },
    jungle:  { farm: 0.35, mechanics: 0.35, teamfight: 0.3 },
    mid:     { farm: 0.3,  mechanics: 0.4, teamfight: 0.3 },
    adc:     { farm: 0.4,  mechanics: 0.4, teamfight: 0.2 },
    support: { farm: 0.1,  mechanics: 0.3, teamfight: 0.6 },
}

const GAME_MINUTES = [3, 5, 8, 12, 15, 18, 22, 25, 28, 32, 35]

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function playerPower(player: Player, pickedChampion?: string, coach?: Coach | null): number {
    const weights = ROLE_WEIGHTS[player.role]
    const champData = pickedChampion ? player.champPool.find(c => c.championId === pickedChampion) : null
    const knowledge = champData?.knowledge ?? 60

    const baseStats =
        player.stats.farm * weights.farm +
        player.stats.mechanics * weights.mechanics +
        player.stats.teamfight * weights.teamfight

    let power = baseStats
        * (0.5 + 0.5 * knowledge / 100)
        * (1 - player.fatigue / 200)
        * (0.8 + player.moral / 500)

    if (coach?.bonus.teamfightMultiplier) {
        power *= 1 + (coach.bonus.teamfightMultiplier - 1) * weights.teamfight
    }

    return power
}

function teamPower(roster: Player[], picks: Record<string, string>, coach?: Coach | null): number {
    const avg = roster.reduce((sum, p) => sum + playerPower(p, picks[p.role], coach), 0) / roster.length
    return avg * (0.85 + Math.random() * 0.30)
}

// Generates one event from the winning team's perspective.
// sign: +1 = player team winning event, -1 = opponent winning event
function makeEvent(
    minute: number,
    attackerNicks: string[],
    victimNicks: string[],
    teamLabel: string,
    killTemplates: Array<(a: string, v: string) => string>,
    sign: 1 | -1
): GameEvent {
    const attacker = pickRandom(attackerNicks)
    const victim = pickRandom(victimNicks)
    let delta = sign * (3 + Math.floor(Math.random() * 8))
    let description: string

    if (minute <= 10) {
        description = pickRandom(killTemplates)(attacker, victim)
    } else if (minute <= 20) {
        if (Math.random() < 0.4) {
            description = `${teamLabel} garante o Drake e aumenta o lead!`
            delta = sign * 5
        } else {
            description = pickRandom(killTemplates)(attacker, victim)
        }
    } else {
        if (Math.random() < 0.3) {
            description = `BARON! ${teamLabel} toma o Baron Nashor e prepara o push final!`
            delta = sign * 15
        } else if (Math.random() < 0.4) {
            description = `Teamfight épica mid lane — ${teamLabel} sai na frente com 3 kills!`
            delta = sign * 10
        } else {
            description = pickRandom(killTemplates)(attacker, victim)
        }
    }

    return { minute, description, advantageDelta: delta }
}

function generateEvents(
    playerRoster: Player[],
    opponentRoster: Player[],
    playerPow: number,
    opponentPow: number
): GameEvent[] {
    const playerNicks   = playerRoster.map(p => p.nickname)
    const opponentNicks = opponentRoster.map(p => p.nickname)
    const playerRatio   = playerPow / (playerPow + opponentPow)

    const playerKillTemplates = [
        (a: string, v: string) => `${a} mata ${v} e abre vantagem no mapa!`,
        (a: string, v: string) => `KILL! ${a} domina ${v} na lane!`,
        (a: string, _: string) => `${a} acerta um outplay incrível e consegue o abate!`,
    ]
    const opponentKillTemplates = [
        (a: string, v: string) => `${a} mata ${v} e coloca pressão!`,
        (a: string, _: string) => `${a} apanha o time de surpresa e consegue um kill!`,
        (a: string, v: string) => `${v} cai para ${a} — difícil recuperar!`,
    ]

    return GAME_MINUTES.map(minute => {
        const playerWins = Math.random() < playerRatio
        return playerWins
            ? makeEvent(minute, playerNicks,   opponentNicks, 'Seu time',  playerKillTemplates,   1)
            : makeEvent(minute, opponentNicks, playerNicks,   'Adversário', opponentKillTemplates, -1)
    })
}

function generateStats(power: number, isWinner: boolean): TeamGameStats {
    const base = power * 2
    return {
        kills:  Math.round(base * (0.8 + Math.random() * 0.4)) + (isWinner ? 3 : 0),
        deaths: Math.round(base * (0.5 + Math.random() * 0.5)) - (isWinner ? 2 : 0),
        gold:   Math.round(40000 + power * 3000 + Math.random() * 5000) + (isWinner ? 8000 : 0),
        towers: Math.floor(Math.random() * 5) + (isWinner ? 4 : 0),
    }
}

export function simulateGame(
    playerRoster: Player[],
    opponentRoster: Player[],
    playerPicks: Record<string, string>,
    opponentPicks: Record<string, string>,
    coach?: Coach | null
): GameResult {
    const playerPow   = teamPower(playerRoster, playerPicks, coach)
    const opponentPow = teamPower(opponentRoster, opponentPicks)

    const events = generateEvents(playerRoster, opponentRoster, playerPow, opponentPow)
    const totalAdvantage = events.reduce((sum, e) => sum + e.advantageDelta, 0)
    const winner: 'player' | 'opponent' = totalAdvantage >= 0 ? 'player' : 'opponent'

    return {
        winner,
        events,
        stats: {
            player:   generateStats(playerPow,   winner === 'player'),
            opponent: generateStats(opponentPow, winner === 'opponent'),
        },
    }
}
