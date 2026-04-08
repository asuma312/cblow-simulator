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
- `position: { x: number; y: number }` — posição atual no mapa (coordenadas do RiftMap 500×500); inicia em `BASE_POSITIONS`
- `atkCooldown: number` — turnos restantes até o próximo ataque (0 = pronto para atacar)
- `currentAction: ActionDefinition` — comportamento da unit (default: `pushLane`)
- Multiplicadores pré-calculados no início da partida:
  ```
  knowledgeMult = 0.5 + 0.5 * (knowledge / 100)   // knowledge do campeão pickado, default 60
  fatigueMult   = 1 - fatigue / 200
  moralMult     = 0.8 + moral / 500
  ```

---

## Sistema de Actions (`engine/simulation/actions.ts`)

Cada `PlayerState` tem uma `currentAction: ActionDefinition` que controla seu comportamento. A interface:

```typescript
interface ActionDefinition {
    id: string
    getTargetPosition(ctx: ActionContext): { x: number; y: number }
    shouldFight(ctx: ActionContext): boolean
    shouldHitTower(ctx: ActionContext): boolean
}
```

`ActionContext` fornece acesso completo ao estado do turno: `ps`, `role`, `side`, `turn`, `allyState`, `enemyState`, `allUnits`.

A única action implementada é **`pushLane`** (default para todos os jogadores):
- `getTargetPosition`: caminha em direção à próxima torre inimiga viva da lane (`outer` → `inner` conforme caem)
- `shouldFight`: sempre `true`
- `shouldHitTower`: sempre `true`

Jungle não tem lane (`ROLE_LANE[jungle] = null`): usa `ROLE_POSITIONS` como fallback de destino e nunca ataca torres.

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
2. **step de posições** — cada unit viva avança em direção ao seu `currentAction.getTargetPosition()`, com lógica anti-crossing para inimigos próximos
3. **decremento de cooldowns** — cada unit viva com `atkCooldown > 0` decrementa 1
4. **combate unificado** — cada unit pronta (`atkCooldown == 0`) escolhe um alvo: campeão inimigo (prioridade) ou torre; ambos consomem o `atkCooldown`
5. **verificação de vitória por torres** (6 destruídas = vitória imediata)
6. **objetivos** (dragão ou barão no turno específico → `continue`)
7. **decremento do barão**
8. **evento do turno**

---

## Step de posições

Cada unit viva executa, por turno:

1. Se `shouldFight` e há inimigo vivo mais próximo:
   - distância `≤ COMBAT_RANGE` → para (já em combate)
   - distância `≤ WALK_SPEED + COMBAT_RANGE` → avança em direção ao inimigo e para **exatamente** na borda do range (`dist - COMBAT_RANGE`), evitando cruzamento
2. Caso contrário → move para `getTargetPosition(ctx)` via `getNextStep` (A*)

`getNextStep` executa A* sobre o grid de walkability 50×50 (`pathfinding.ts`) e retorna a próxima posição a até `WALK_SPEED = 80px` de distância, seguindo as lanes. Se nenhum caminho for encontrado, cai back para `stepToward` em linha reta.

O target de `pushLane` é determinado por `getNextStep(ps.position, finalTarget)`, onde `finalTarget` é a torre inimiga da lane: outer se viva, inner caso outer tenha caído. Assim, unidades de lados opostos caminham uma em direção à outra e se encontram naturalmente na lane, respeitando o layout do mapa.

```
BASE_POSITIONS (posição inicial e de respawn):
  player:   { x:0,   y:468 }   // canto inferior-esquerdo
  opponent: { x:468, y:0   }   // canto superior-direito

ROLE_POSITIONS (usadas apenas como fallback para jungle):
  top:     player { x:35,  y:75  }  opponent { x:80,  y:35  }
  jungle:  player { x:89,  y:210 }  opponent { x:366, y:258 }
  mid:     player { x:206, y:246 }  opponent { x:246, y:219 }
  adc:     player { x:363, y:424 }  opponent { x:435, y:369 }
  support: player { x:392, y:417 }  opponent { x:425, y:395 }
```

---

## Combate unificado

Por turno, cada unit viva e pronta (`atkCooldown == 0`) escolhe **um** alvo — o mesmo ataque consome o cooldown em ambos os casos:

### Prioridade 1: campeão inimigo

Se `shouldFight(ctx)` e há inimigos vivos dentro de `COMBAT_RANGE`:
- Escolhe 1 aleatoriamente
- Aplica `damageRoll * DAMAGE_SCALE` ao HP do alvo
- Reseta `atkCooldown`

### Prioridade 2: torre inimiga

Se nenhum campeão inimigo estava em range e `shouldHitTower(ctx)`:
- Verifica se a unidade está dentro de `COMBAT_RANGE` da torre alvo (`activeTowerPos`)
- Se sim: executa `hitTower`, reseta `atkCooldown`

Não existe `counterDamage`. Cada unit ataca independentemente no seu próprio cooldown.

### Cooldown baseado em mechanics

```
attackCooldown = max(1, round(10 / mechanics))
  mechanics 10 → cooldown 1  (ataca todo turno)
  mechanics 5  → cooldown 2  (a cada 2 turnos)
  mechanics 2  → cooldown 5
  mechanics 1  → cooldown 10
```

### Dano por ataque (`damageRoll`)

Mechanics foi **removido** do dano — só determina cooldown.

```
damageRoll = rand(0.5, 1.5)
           * (farm * w.farm + teamfight * w.teamfight)
           * knowledgeMult * fatigueMult * moralMult
           * matchupMult

damage aplicado = damageRoll * DAMAGE_SCALE (4)
```

```
COMBAT_RANGE = 40px
WALK_SPEED   = 80px/turno
DAMAGE_SCALE = 4
```

---

## Kill, assist e respawn

```
KILL_GOLD         = 500   // vai para o killer
ASSIST_GOLD_SHARE = 0.5   // fração do kill gold para cada assister → 250 por assister
ASSIST_WINDOW     = 5     // turnos anteriores que qualificam para assist
RESPAWN           = 2     // turnos morto; ao retornar hp = 100
```

### Assist tracking

Durante o combate, um `damageLog` (`Map<PlayerState, {attackerPs, turn}[]>`) registra cada hit que não mata. Ao ocorrer um kill:

1. `resolveKill` consulta o log da vítima filtrando entradas com `turn >= currentTurn - ASSIST_WINDOW`
2. Deduplica os atacantes com `Set` (a mesma unit pode ter acertado múltiplas vezes)
3. Exclui o próprio killer
4. Cada assister recebe `floor(KILL_GOLD * ASSIST_GOLD_SHARE)` de ouro
5. O log da vítima é apagado — ao reviver, começa sem histórico

### Respawn

Ao matar:
- `victimPs.deadUntilTurn = turn + RESPAWN`
- `victimPs.position = BASE_POSITIONS[lado da vítima]` — teleporte imediato para a base
- `victimPs.atkCooldown = attackCooldown(mechanics)` — reset para quando reviver

Ao reviver (em `farmTick`): `deadUntilTurn = null`, `hp = 100`. Na sequência do turno, o step de posições começa a mover a unit de volta à lane.

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

Uma unit só bate em torre quando:
1. Está viva e com `atkCooldown == 0`
2. Nenhum campeão inimigo estava no `COMBAT_RANGE` neste turno
3. Sua role tem lane definida em `ROLE_LANE` (jungle = null → nunca bate em torre)
4. Está dentro de `COMBAT_RANGE` da torre alvo (`activeTowerPos`)

A posição da torre alvo é `LANE_TOWER_POSITIONS[defSide][lane].outer` se outer > 0, senão `.inner`.

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

Todos os metas têm `phase: 'game'`, `towerSnapshot`, `goldSnapshot` e `positionSnapshot`.

### `CombatResult` (dentro de `eventMeta[].combats`)

```typescript
{
    attackerRole:     Role
    defenderRole:     Role
    attackerIsPlayer: boolean
    damage:           number     // damageRoll * DAMAGE_SCALE aplicado ao defensor
    killedDefender:   boolean
    goldGained:       number
    // counterDamage foi removido — ataques são independentes por cooldown
}
```

### `positionSnapshot` (dentro de `GameEventMeta`)

```typescript
positionSnapshot: {
    player:   { x: number; y: number }[]   // índice = ROLES index
    opponent: { x: number; y: number }[]
}
```

Captura as posições de todas as units ao final de cada turno. Usado pelo `RiftMap` para animar movimento.

---

## Constantes de referência rápida

```
TOTAL_TURNS = 60
DRAGON_TURNS = [20, 30, 40]   BARON_TURN = 45
PLAYER_HP = 100     KILL_GOLD = 500    RESPAWN = 2
ASSIST_GOLD_SHARE = 0.5       ASSIST_WINDOW = 5 turnos
GOLD_PER_FARM = 15  REFERENCE_GOLD = 15000   GOLD_MULT_CAP = 1.3
TOWER_HITS = 3      TOWER_GOLD = 1000
BOT_ADC_FARM_SHARE = 0.7   BOT_SUP_FARM_SHARE = 0.3
BARON_MULT = 1.2    BARON_DURATION = 5 turnos  DRAGON_BUFF = 0.05/stack

COMBAT_RANGE = 40px   WALK_SPEED = 80px/turno   DAMAGE_SCALE = 4
```

---

## Estrutura de módulos (`src/engine/simulation/`)

```
constants.ts  ←  helpers.ts  ←  state.ts
     ↑               ↑               ↓
  actions.ts   pathfinding.ts   matchups.ts
     ↑                               ↓
     └──────────────────────── index.ts  (API pública: simulateGame)
```

| Arquivo | Exporta |
|---------|---------|
| `constants.ts` | Constantes numéricas, `ROLE_WEIGHTS`, `ROLE_POSITIONS`, `BASE_POSITIONS`, `ROLE_LANE`, `LANE_TOWER_POSITIONS`, `attackCooldown()` |
| `helpers.ts` | `rand`, `randInt`, `getKnowledge`, `stepToward`, `FALLBACK_PLAYER` |
| `pathfinding.ts` | `walkableGrid`, `findPath`, `getNextStep`, `GRID_COLS`, `GRID_ROWS`, `CELL_SIZE` |
| `state.ts` | `initTeamState`, `updateGoldMultiplier`, `farmTick`, `teamfightPower` |
| `matchups.ts` | `getMatchupMult` — multiplicador de matchup por campeão/role |
| `actions.ts` | `ActionDefinition`, `ActionContext`, `pushLane`, `DEFAULT_ACTION` |
| `index.ts` | `simulateGame` (único export público) |

O import externo `@/engine/simulation` resolve para `index.ts` automaticamente.
