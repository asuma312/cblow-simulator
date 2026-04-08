# Como funciona o Gameplay

> Referência técnica para agentes. Descreve a lógica de `src/engine/simulation/` com fórmulas exatas e constantes atuais.

## Visão geral

`simulateGame(playerRoster, opponentRoster, playerPicks, opponentPicks, coach?)` executa a partida em um **loop único de até 60 turnos** e retorna `SimulationResult`. O estado de cada time é mantido em `TeamState` durante toda a simulação.

---

## Estado interno (`TeamState` / `PlayerState`)

Cada time tem um `TeamState` com:
- `playerStates: PlayerState[]` — um por role, na ordem `ROLES = ['top','jungle','mid','adc','support']`
- `totalGold`, `goldMultiplier`, `dragonCount`
- `towers: TeamTowers` — `{ top, mid, bot }`, cada lane com `{ outer: number; inner: number }` (hits restantes; 0 = destruída)

Cada `PlayerState` carrega:
- `gold`, `hp` (inicia em 100), `deadUntilTurn: number | null`
- `dragonStacks`
- `baronActive: boolean`, `baronTurnsRemaining: number` — barão é **por jogador**, não por time
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

## Farm tick (todo turno)

Acontece no início de cada turno para todos os jogadores vivos. Bot lane tem split de farm:
```
farmStat = farm * w.farm + mechanics * w.mechanics * 0.2
share    = 0.7 (ADC) | 0.3 (Support) | 1.0 (demais roles)
gold    += farmStat * 15 * knowledgeMult * fatigueMult * moralMult * share
```
`goldMultiplier` do time é recalculado após o farm:
```
goldMultiplier = min(1.3, 1 + totalGold / 15000 * 0.3)
```

Jogador morto pula o farm até `deadUntilTurn`. Ao retornar, `deadUntilTurn = null` e `hp = 100`.

---

## Loop principal (turnos 1–60)

Cada turno executa na ordem:

1. **farm** para ambos os times
2. **combates de lane** (top, mid, bot)
3. **hits de torre** (quando adversário de lane está morto)
4. **verificação de vitória por torres** (6 destruídas = vitória imediata)
5. **objetivos** (dragão ou barão no turno específico → `continue`)
6. **decremento do barão**
7. **evento do turno**

---

## Combates de lane

### Top e Mid — 1v1

Para cada role em `['top', 'mid']`:
- Ambos vivos → combate:
  ```
  roll = rand(0.5, 1.5) * (mechanics * w.mechanics + farm * w.farm)
       * knowledgeMult * fatigueMult * moralMult * matchupMult
  ```
  Dano: `max(0, |rollP - rollO|) * 5` ao perdedor. Kill se `hp <= 0`.
- Um vivo, outro morto → o vivo bate na torre inimiga da lane (`hitTower`).

### Jungle — sem combate

### Bot lane — 2v2 (ADC + Support)

Roll individual (inclui teamfight):
```
roll(ps) = rand(0.5, 1.5) * (mechanics * w.mechanics + farm * w.farm + teamfight * w.teamfight)
         * knowledgeMult * fatigueMult * moralMult * matchupMult
```
Poder combinado (apenas vivos):
```
pBotRoll = rollAdc + rollSup
```
Dano: `max(0, |pBotRoll - oBotRoll|) * 5`.

Alvo: aleatório entre os vivos do lado perdedor.

Kill: killer = quem tiver maior roll individual; assister = o outro vivo se `roll > 0`.

Tower hits na bot lane (independentes por par): cada jogador bate na torre quando seu **counterpart direto** está morto.

---

## Kill e respawn

```
KILL_GOLD     = 500    // vai para o killer
ASSIST_GOLD   = 250    // 50% do kill gold vai para o assister (se houver)
RESPAWN       = 2      // turnos morto; ao retornar hp = 100
```
Cada kill gera `advantageDelta = ±randInt(4, 8)`.

---

## Sistema de torres

6 torres por time (outer + inner para cada lane: top, mid, bot). Cada torre aguenta **3 acertos** antes de cair.

```
hitTower(atacante, time_defensor, lane):
  se outer > 0: outer--; se outer == 0 → atacante.gold += 1000
  senão se inner > 0: inner--; se inner == 0 → atacante.gold += 1000
```

Inner só pode ser atacada após outer ser destruída (outer = 0). Torre destruída: `opacity: 0.15 + grayscale` no RiftMap.

Vitória imediata ao destruir todas as 6 torres do adversário.

Torre destruída gera `advantageDelta = ±12`.

---

## Objetivos

### Dragão (turnos 20, 30, 40)

```
poder = teamfightPower(team, 0.4, 0.6)
teamfightPower = média(mechanics * wM + teamfight * wT, por jogador)
              * (1 + dragonStacks * 0.05) * (baronActive ? 1.2 : 1)  // por jogador
              * goldMultiplier * rand(0.85, 1.15)
```
Vencedor: maior poder. Cada jogador do time vencedor: `dragonStacks++`.

`advantageDelta`: ±8 no 1º e 2º dragão; ±12 no 3º.

### Barão (turno 45)

```
poder = teamfightPower(team, 0.3, 0.7)
```
Vencedor: cada `PlayerState` do time ganha `baronActive = true` por 5 turnos. `advantageDelta` = ±15.

O buff é decrementado por jogador a cada turno (`--baronTurnsRemaining`).

---

## Pós-60 turnos

Se nenhum nexus foi destruído:
```
playerDestroyed   = torres destruídas do adversário
opponentDestroyed = torres destruídas do player
se playerDestroyed > opponentDestroyed → player vence
se opponentDestroyed > playerDestroyed → adversário vence
empate → quem tem mais totalGold vence
```

---

## Saída: `SimulationResult`

| Campo | Descrição |
|-------|-----------|
| `winner` | `'player' \| 'opponent'` |
| `events` | Array de `GameEvent` com `minute`, `description`, `advantageDelta` |
| `eventMeta` | Array de `GameEventMeta` paralelo a `events` |
| `finalGold` | `{player, opponent}` — ouro total acumulado |
| `finalKills` | `{player, opponent}` |
| `dragonWins` | `{player, opponent}` |
| `baronWinner` | `'player' \| 'opponent' \| null` |
| `finalTowers` | `{player: TeamTowers, opponent: TeamTowers}` — estado final das torres |
| `stats` | `{player, opponent}` — `TeamGameStats` com kills/deaths/gold/towers reais |

### Tipos de `GameEventMeta.type`

| type | quando aparece |
|------|---------------|
| `kill` | turno com ao menos 1 kill |
| `turn_summary` | turno sem kill nem torre |
| `dragon` | captura de dragão |
| `baron` | captura de barão |
| `tower_destroyed` | torre destruída (ou nexus ao final) |

Todos os metas têm `phase: 'game'`, `towerSnapshot` e `goldSnapshot`.

### `CombatResult` (dentro de `eventMeta[].combats`)

```typescript
{
    attackerRole: Role
    defenderRole: Role
    attackerIsPlayer: boolean
    damage: number
    killedDefender: boolean
    goldGained: number
    assistantRole?: Role
    assistantIsPlayer?: boolean
    assistGoldGained?: number
}
```

---

## Constantes de referência rápida

```
TOTAL_TURNS = 60
DRAGON_TURNS = [20, 30, 40]   BARON_TURN = 45
PLAYER_HP = 100     KILL_GOLD = 500    RESPAWN = 2
ASSIST_GOLD_SHARE = 0.5
GOLD_PER_FARM = 15  REFERENCE_GOLD = 15000   GOLD_MULT_CAP = 1.3
TOWER_HITS = 3      TOWER_GOLD = 1000
BOT_ADC_FARM_SHARE = 0.7   BOT_SUP_FARM_SHARE = 0.3
BARON_MULT = 1.2    BARON_DURATION = 5 turnos  DRAGON_BUFF = 0.05/stack
```

---

## Estrutura de módulos (`src/engine/simulation/`)

```
constants.ts  ←  helpers.ts  ←  state.ts
                                    ↓
                              matchups.ts
                                    ↓
                              index.ts  (API pública: simulateGame)
```

| Arquivo | Exporta |
|---------|---------|
| `constants.ts` | Todas as constantes numéricas + `ROLE_WEIGHTS` |
| `helpers.ts` | `rand`, `randInt`, `getKnowledge`, `FALLBACK_PLAYER` |
| `state.ts` | `initTeamState`, `updateGoldMultiplier`, `farmTick`, `teamfightPower` |
| `matchups.ts` | `getMatchupMult` — multiplicador de matchup por campeão/role |
| `index.ts` | `simulateGame` (único export público) |

O import externo `@/engine/simulation` resolve para `index.ts` automaticamente.
