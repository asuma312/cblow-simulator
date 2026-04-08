# Como funciona o Gameplay

> Referência técnica para agentes. Descreve a lógica de `src/engine/simulation/` com fórmulas exatas e constantes atuais.

## Visão geral

`simulateGame(playerRoster, opponentRoster, playerPicks, opponentPicks, coach?)` executa a partida em 3 fases sequenciais e retorna `SimulationResult`. O estado de cada time é mantido em `TeamState` durante toda a simulação.

```
Early Game (15 turnos) → Mid Game (20 turnos) → Late Game (até 10 turnos)
```

---

## Estado interno (`TeamState` / `PlayerState`)

Cada time tem um `TeamState` com:
- `playerStates: PlayerState[]` — um por role, na ordem `ROLES = ['top','jungle','mid','adc','support']`
- `totalGold`, `goldMultiplier`, `dragonCount`, `baronActive`, `baronTurnsRemaining`

Cada `PlayerState` carrega:
- `gold`, `hp` (inicia em 100), `deadUntilTurn: number | null`
- `dragonStacks`
- Multiplicadores pré-calculados no início da partida:
  ```
  knowledgeMult = 0.5 + 0.5 * (knowledge / 100)   // knowledge do campeão pickado, default 60
  fatigueMult   = 1 - fatigue / 200
  moralMult     = 0.8 + moral / 500
  ```

---

## Multiplicadores de role (`ROLE_WEIGHTS`)

| Role    | farm | mechanics | teamfight |
|---------|------|-----------|-----------|
| top     | 0.30 | 0.40      | 0.30      |
| jungle  | 0.35 | 0.35      | 0.30      |
| mid     | 0.30 | 0.40      | 0.30      |
| adc     | 0.40 | 0.40      | 0.20      |
| support | 0.10 | 0.30      | 0.60      |

---

## Farm tick (todo turno em todas as fases)

Acontece no início de cada turno para todos os jogadores vivos:
```
farmStat = farm * w.farm + mechanics * w.mechanics * 0.2
gold     += farmStat * 15 * knowledgeMult * fatigueMult * moralMult
```
`goldMultiplier` do time é recalculado após o farm:
```
goldMultiplier = min(1.3, 1 + totalGold / 15000 * 0.3)
```

Jogador morto pula o farm até `deadUntilTurn`. Ao retornar, HP é restaurado para 100.

---

## Early Game (15 turnos)

Cada turno: farm → combates de lane → eventos.

### Top e Mid — 1v1

Para cada role em `['top', 'mid']`:
- Se qualquer dos dois está morto no turno → pular
- Roll de cada jogador:
  ```
  roll = rand(0.5, 1.5) * (mechanics * w.mechanics + farm * w.farm) * knowledgeMult * fatigueMult * moralMult
  ```
- Dano: `max(0, |rollA - rollB|) * 5`
- HP do perdedor é reduzido; kill se `hp <= 0`

### Jungle — sem combate

Jungler não participa de combates no early game.

### Bot lane — 2v2 (ADC + Support juntos)

Roll individual (inclui teamfight):
```
roll(ps) = rand(0.5, 1.5) * (mechanics * w.mechanics + farm * w.farm + teamfight * w.teamfight)
         * knowledgeMult * fatigueMult * moralMult
```
Poder combinado do lado (soma apenas jogadores vivos):
```
playerBotRoll    = rollAdc(vivo) + rollSup(vivo)
opponentBotRoll  = rollAdc(vivo) + rollSup(vivo)
```
Dano: `max(0, |playerBotRoll - opponentBotRoll|) * 5`

Alvo (lado perdedor): aleatório entre os dois vivos (`Math.random() < 0.5`), ou o único vivo se um já está morto.

Kill gold vai para o ADC do lado vencedor. Descrição do evento:
- Atacante é player: `"NickAdc e NickSup abateram NickTarget na bot lane!"`
- Atacante é oponente: `"NickAdc e NickSup sofrem pressão — NickTarget cai!"`

### Kill e respawn

```
KILL_GOLD = 500   // vai para o atacante (ADC na bot lane)
RESPAWN   = 3     // turnos morto; ao retornar hp = 100
```
Cada kill gera `advantageDelta = ±randInt(4, 8)`.

---

## Mid Game (20 turnos)

HP e `deadUntilTurn` são resetados para todos no início. Sem combates de lane.

### Dragões (turnos 6 e 13)

```
poder = teamfightPower(team, 0.4, 0.6)
teamfightPower = média(mechanics * 0.4 + teamfight * 0.6, ponderado por knowledgeMult/fatigueMult/moralMult)
              * goldMultiplier * rand(0.85, 1.15)
```
Vencedor: maior `poder`. Cada jogador do time vencedor ganha +1 `dragonStacks`.

`advantageDelta`: ±8 no 1º dragão, ±12 no 2º.

### Barão (turno 18)

```
poder = teamfightPower(team, 0.3, 0.7)   // mais teamfight que no dragão
```
Vencedor fica com `baronActive = true` por 5 turnos late. `advantageDelta` = ±15.

### Demais turnos

Apenas farm, sem eventos de combate.

---

## Late Game (até 10 turnos)

Decide o vencedor da partida. Sem farm adicional relevante — usa o estado acumulado.

Cada turno: 5 sub-rolls. Cada sub-roll:
```
poder = teamfightPower(team, 0.5, 0.5)
      * (1 + dragonStacks * 0.05)          // +5% por stack de dragão
      * (baronActive ? 1.2 : 1)            // +20% com barão
```
Turno vencido por quem ganhar ≥ 3 dos 5 sub-rolls.

Partida encerrada ao atingir **3 turnos vencidos** (ou empate ao acabar os 10 → mais turnos ganhos vence).

---

## Saída: `SimulationResult`

| Campo | Descrição |
|-------|-----------|
| `winner` | `'player' \| 'opponent'` |
| `events` | Array de `GameEvent` com `minute`, `description`, `advantageDelta` |
| `eventMeta` | Array de `GameEventMeta` paralelo a `events` com `type`, `phase`, `combats[]` |
| `phases` | `[{phase:'early'}, {phase:'mid'}, {phase:'late', winner}]` |
| `finalGold` | `{player, opponent}` — ouro total acumulado |
| `finalKills` | `{player, opponent}` — kills do early game |
| `dragonWins` | `{player, opponent}` |
| `baronWinner` | `'player' \| 'opponent' \| null` |
| `stats` | `{player, opponent}` — `TeamGameStats` cosmético gerado via `generateStats` |

### Tipos de `GameEventMeta.type`

| type | quando aparece |
|------|---------------|
| `phase_header` | início de cada fase |
| `kill` | turno do early com ao menos 1 kill |
| `turn_summary` | turno do early sem kill, ou turno normal do mid |
| `dragon` | captura de dragão |
| `baron` | captura de barão |
| `late_turn_won` | cada turno do late game |

### `CombatResult` (dentro de `eventMeta[].combats`)

```typescript
{
    attackerRole: Role        // role do atacante; 'adc' representa o duo bot lane
    defenderRole: Role        // role de quem levou o dano (pode ser 'support' em bot lane)
    attackerIsPlayer: boolean
    damage: number
    killedDefender: boolean
    goldGained: number
}
```

---

## Constantes de referência rápida

```
EARLY_TURNS = 15    MID_TURNS = 20     LATE_TURNS = 10
LATE_TURN_WIN_REQ = 3   LATE_SUB_ROLLS = 5   LATE_SUB_WIN_REQ = 3
PLAYER_HP = 100     KILL_GOLD = 500    RESPAWN = 3
GOLD_PER_FARM = 15  REFERENCE_GOLD = 15000   GOLD_MULT_CAP = 1.3
BARON_MULT = 1.2    BARON_DURATION = 5 turns  DRAGON_BUFF = 0.05/stack
MID_DRAGON_TURNS = [6, 13]   MID_BARON_TURN = 18
```

---

## Estrutura de módulos (`src/engine/simulation/`)

A engine é modularizada em 7 arquivos com grafo de dependência sem ciclos:

```
constants.ts  ←  helpers.ts  ←  state.ts  ←  early.ts
                                          ←  mid.ts
                                          ←  late.ts
                                                  ↓
                                              index.ts  (API pública)
```

| Arquivo | Exporta |
|---------|---------|
| `constants.ts` | Todas as constantes numéricas + `ROLE_WEIGHTS` |
| `helpers.ts` | `rand`, `randInt`, `getKnowledge`, `FALLBACK_PLAYER` |
| `state.ts` | `initTeamState`, `updateGoldMultiplier`, `farmTick`, `teamfightPower` |
| `early.ts` | `runEarlyGame` |
| `mid.ts` | `runMidGame` |
| `late.ts` | `runLateGame` |
| `index.ts` | `simulateGame` (único export público) |

O import externo `@/engine/simulation` resolve para `index.ts` automaticamente — nenhum caller precisa ser alterado ao modificar os módulos internos.
