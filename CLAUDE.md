# CBlow Simulator — CLAUDE.md

Simulador web de gerenciamento esportivo inspirado no **CBlow**, campeonato real de LoL de baixo elo organizado pelo streamer Yoda (kick.com/yoda). O jogador é um Manager que drafta jogadores, treina o time e compete em um torneio de dupla eliminação. Roda 100% offline no browser.

## Comandos

```bash
npm run dev                  # servidor de desenvolvimento
npm run build                # type-check + build de produção
npm run preview              # preview do build
npm run download-champions   # baixa imagens DDragon para public/champions/
node scripts/migrate-champions.mjs  # (one-shot) converte .ts de campeões → .json com matchups embutidos
```

## Stack

- **Vue 3** (Composition API + `<script setup>`)
- **Pinia** — estado global (5 stores)
- **Vue Router 4** — hash history (`/#/rota`)
- **TypeScript 5**
- **Tailwind CSS 3** + **SCSS** (componentes usam `<style lang="scss" scoped>`)
- **Vite 5**

## Estrutura de pastas

```
src/
├── types/game.types.ts          # todos os tipos do jogo
├── types/championSelect.types.ts
├── data/
│   ├── players/index.ts         # ALL_PLAYERS + getPlayersByRole
│   ├── coaches/index.ts         # COACHES (4 coaches)
│   ├── teams/index.ts           # AI_TEAMS (8 times de IA)
│   ├── champions/               # um .json por campeão (id, name, positions, matchups)
│   └── trainingActions.ts       # metadados das ações de treino (fonte única)
├── stores/
│   ├── game.ts                  # fase do jogo, semana, scores da série
│   ├── team.ts                  # elenco do player, coach, budget
│   ├── tournament.ts            # bracket de dupla eliminação
│   ├── training.ts              # plano semanal e execução
│   └── champions.ts             # draft (ban/pick), lista de campeões
├── engine/
│   ├── simulation/              # engine de simulação (ver seção abaixo)
│   │   ├── index.ts             # simulateGame() — loop principal
│   │   ├── actions.ts           # ActionDefinition, ActionContext, pushLane, DEFAULT_ACTION
│   │   ├── state.ts             # initTeamState, farmTick, teamfightPower
│   │   ├── matchups.ts          # getMatchupMult() — bônus de counter via matchups embutidos
│   │   ├── constants.ts         # constantes numéricas da simulação
│   │   └── helpers.ts           # rand, randInt, getKnowledge, stepToward, FALLBACK_PLAYER
│   ├── ai-draft.ts              # lógica de ban/pick da IA
│   └── ai-team.ts               # acesso aos times de IA
├── components/
│   ├── champion-select/         # componentes do draft
│   ├── gameplay/
│   │   ├── GameLog.vue          # log de eventos com ícones por tipo
│   │   └── RiftMap.vue          # minimapa 500×500 com ícones, torres, drag mode
│   ├── shared/PlayerCard.vue
│   ├── training/TrainingAction.vue
│   └── tournament/BracketView.vue
├── views/                       # uma view por rota
├── composables/useTimer.ts
└── utils/
    ├── storage.ts               # loadFromStorage<T> / saveToStorage<T>
    ├── championImages.ts        # fallback DDragon para imagens
    └── debug.ts                 # helpers de dev (registrados só em import.meta.env.DEV)

public/
└── minimap.png                  # imagem do minimapa do Summoner's Rift (fundo do RiftMap)

data/                            # estatísticas reais do CBlow (fonte: cblowstats.netlify.app)
├── data.json
├── data_historico.json
└── counters/                    # JSONs de matchup por campeão+role (usados apenas pelo migrate script)
    └── {champion}_{role}.json

scripts/
├── download-champions.mjs       # baixa ícones DDragon para public/champions/
└── migrate-champions.mjs        # (one-shot) converte .ts → .json e embutem matchups
```

## Game loop

```
/ (Home) → /setup → /tournament → /training → /champselect → /gameplay → /tournament → ...
                                                                              └── /gameover ou vitória
```

- **Setup:** nome do time → escolha de coach → **snake draft** (8 times × 5 roles = 40 picks)
- **Tournament:** bracket visual, simula partidas de IA, define próxima partida do player
- **Training:** cada jogador recebe uma ação semanal, salários são pagos
- **ChampSelect:** player controla um lado (blue/red alternando), IA controla o outro
- **Gameplay:** loop único de 60 turnos com minimapa animado + log de eventos
- A série (Bo3/Bo5) repete ChampSelect → Gameplay até ter vencedor
- Derrota na Losers → `/gameover`; vitória na Grand Final → tela de vitória

## Snake Draft (`views/SetupView.vue`)

8 times (player + 7 IA sorteados de `AI_TEAMS`) draftam do mesmo pool `ALL_PLAYERS`.

```typescript
const TOTAL_PICKS = AI_TEAMS.length * ROLES.length  // 8 × 5 = 40
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

// Snake: round par → ordem normal; round ímpar → ordem invertida
function currentPickTeam(): string {
  const round = Math.floor(idx / n)
  const pos = idx % n
  return draftOrder[round % 2 === 0 ? pos : n - 1 - pos]
}
```

IA prioriza `preferredPlayerIds` em ordem aleatória de roles; fallback: melhor stat total disponível.

## Persistência

Cada store salva no `localStorage` via `utils/storage.ts`:

| Store | Chave |
|-------|-------|
| `game` | `cblow-game-save` |
| `team` | `cblow-save` |
| `tournament` | `cblow-tournament-save` |

`training` não persiste (plano dura apenas uma semana).

## Tipos principais (`src/types/game.types.ts`)

```typescript
type Role = 'top' | 'jungle' | 'mid' | 'adc' | 'support'

interface Champion {
  id: string          // DDragon name — usado para imagem e champPool
  name: string
  positions: ChampionPosition[]
  matchups?: Record<string, Record<string, number>>  // role -> opponentName -> winRate
}

interface TowerLaneState { outer: number; inner: number }  // hits restantes; 0 = destruída
interface TeamTowers { top: TowerLaneState; mid: TowerLaneState; bot: TowerLaneState }

interface Player {
  id, name, nickname, role: Role
  stats: { farm, mechanics, teamfight }  // 1–10
  champPool: { championId, knowledge }[] // knowledge 0–100
  popularity, moral, fatigue             // 0–100
}

interface PlayerState {
  player, pickedChampionId, gold, hp
  deadUntilTurn: number | null
  dragonStacks: number
  baronActive: boolean          // barão por jogador (não por time)
  baronTurnsRemaining: number
  knowledgeMult, fatigueMult, moralMult
  position: { x: number; y: number }   // posição atual no mapa (500×500); inicia em BASE_POSITIONS
  atkCooldown: number                  // turnos até próximo ataque (0 = pronto)
  currentAction: ActionDefinition      // comportamento da unit (default: pushLane)
}

interface TeamState {
  label, playerStates[], totalGold, goldMultiplier, dragonCount
  towers: TeamTowers            // 6 torres por time (outer + inner por lane)
}

interface AITeam {
  id, name, archetype
  roster: Player[]
  preferredPlayerIds: string[]
}

interface Match {
  id, teamA, teamB, winner?
  format: 'bo3' | 'bo5'
  bracket: 'winners' | 'losers' | 'grand_final'
  round: number
}

type GameState.phase = 'setup' | 'training' | 'champselect' | 'gameplay' | 'tournament' | 'gameover' | 'victory'

interface SimulationResult extends GameResult {
  eventMeta: GameEventMeta[]
  finalGold: { player, opponent }
  finalKills: { player, opponent }
  dragonWins: { player, opponent }
  baronWinner: 'player' | 'opponent' | null
  finalTowers: { player: TeamTowers; opponent: TeamTowers }
}
```

## Simulação (`engine/simulation/`)

Documentação completa da engine em `info/HOW_GAMEPLAY_WORKS.md`.

## RiftMap (`components/gameplay/RiftMap.vue`)

Minimapa 500×500px com fundo `/public/minimap.png`. Camadas:
1. Imagem de fundo
2. Indicadores de barão/dragão (círculos com stacks coloridas)
3. Torres (SVG, azul/vermelho, 6 player + 6 opponent) — `tower--destroyed` quando HP = 0
4. Range circles (apenas no drag mode) — círculo tracejado de `COMBAT_RANGE * 2` de diâmetro, centralizado no meio do ícone (`+18px`)
5. Ícones dos campeões — posicionados via `positionSnapshot` do engine; CSS `transition: left/top 600ms` suaviza o movimento

Badge superior: `"TURNO X / 60"` baseado em `currentTurnMeta?.turnNumber`.

**Posicionamento**: ícones lêem `currentTurnMeta.positionSnapshot` (player/opponent por índice de ROLES). A lógica de andar e teletransportar para a base é feita pelo engine (`stepToward` em `helpers.ts`); o RiftMap apenas exibe as coordenadas resultantes.

**Animações**: `flash-hit` (dano — dispara no defensor), `flash-kill` (morte + grayscale). Não há mais `counterDamage` — cada unit reage no seu próprio cooldown.

**Destruição de torre**: `isTowerDestroyed(key)` parseia a chave diretamente (`'pt_top_out'` → player/top/outer) sem mapa estático.

**Drag mode** (dev): `__debugMapPositions()` no console ativa arrastar ícones e torres; chamar de novo imprime todas as coordenadas no formato `ROLE_POSITIONS` prontas para colar no código. Os range circles ficam visíveis no drag mode para validar o `COMBAT_RANGE`.

## Debug (`utils/debug.ts`)

Registrado apenas em `import.meta.env.DEV` via `main.ts`.

```js
// Console do DevTools:
__debugGameplay()        // partida bo3 aleatória → navega para /gameplay
__debugGameplay('bo5')   // partida bo5
__debugMapPositions()    // toggle drag mode no RiftMap
```

## Bracket de dupla eliminação

8 times. IDs dos matches:
- Winners: `wb_r1_0..3`, `wb_r2_0..1`, `wb_final`
- Losers: `lb_r1_0..3`, `lb_r2_0..1`, `lb_r3_0..1`, `lb_final`
- Grand Final: `grand_final`

Propagação centralizada em `tournament._propagate()` — tabela de rotas `routes[bracket_round]`.
`initTournament(playerTeamId, selectedAITeamIds)` recebe os 7 times sorteados no draft.

## Champion Select

- Draft order padrão de 20 passos (6 bans + 5 picks por lado)
- `stores/champions.ts` controla o estado; `playerSide` define qual lado o player controla
- O grid fica bloqueado (`pointer-events: none`) durante os turnos da IA
- IA bana os campeões com `knowledge > 70` do player; pica o de maior conhecimento disponível por role
- Imagens: `/champions/{ChampionId}.png` — fallback para DDragon CDN via `utils/championImages.ts`

## Dados de treino

`data/trainingActions.ts` é a **fonte única** de labels e ícones das ações. Não duplicar em outros arquivos.

Efeitos por ação (em `stores/training.ts`):
- `trainFarm/Mechanics/Teamfight`: stat +0.2 (cap 10), fadiga +10
- `trainMechanics` com Coach Técnico: +0.2 + `mechanicsTrainBonus`
- `studyChampion`: conhecimento +5–10 (random), fadiga +5
- `stream`: budget += 500–2000 (baseado em popularidade), fadiga -5, popularidade +5
- `rest`: fadiga -20, moral +5

## Tema visual

Cores bronze (usar como referência, não Tailwind puro):
```
--bronze-dark:    #1a0d06   (background geral)
--bronze-card:    #2a1508   (cards/painéis)
--bronze-border:  #8B5E3C   (bordas)
--bronze-accent:  #C8860A   (textos de destaque, botões ativos)
--bronze-light:   #F5F0E8   (texto principal)
```

Componentes usam `clip-path` octagonal nos cards e bordas dourado-bronze.

## Convenções

- Todo texto da UI em **português brasileiro**
- Sem emojis em nenhum arquivo ou componente
- Stores usam Options API do Pinia (`defineStore({ state, getters, actions })`)
- `_save()` é chamado manualmente no final de cada action que muta estado persistido
- Não adicionar `console.log` de debug em produção
- Imagens de campeões não são commitadas — ficam em `public/champions/` (no `.gitignore`)
- `.claude/` está no `.gitignore` (memória local do Claude Code, não commitar)
- `public/minimap.png` não é commitado (no `.gitignore`)
