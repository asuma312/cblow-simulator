# CBlow Simulator — CLAUDE.md

Simulador web de gerenciamento esportivo inspirado no **CBlow**, campeonato real de LoL de baixo elo organizado pelo streamer Yoda (kick.com/yoda). O jogador é um Manager que drafta jogadores, treina o time e compete em um torneio de dupla eliminação. Roda 100% offline no browser.

## Comandos

```bash
npm run dev                  # servidor de desenvolvimento
npm run build                # type-check + build de produção
npm run preview              # preview do build
npm run download-champions   # baixa imagens DDragon para public/champions/
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
├── types/game.types.ts          # todos os tipos do jogo (incluindo tipos da simulação 3 fases)
├── types/championSelect.types.ts
├── data/
│   ├── players/index.ts         # ALL_PLAYERS + getPlayersByRole
│   ├── coaches/index.ts         # COACHES (4 coaches)
│   ├── teams/index.ts           # AI_TEAMS (8 times de IA)
│   ├── champions/               # um arquivo por campeão
│   └── trainingActions.ts       # metadados das ações de treino (fonte única)
├── stores/
│   ├── game.ts                  # fase do jogo, semana, scores da série
│   ├── team.ts                  # elenco do player, coach, budget
│   ├── tournament.ts            # bracket de dupla eliminação
│   ├── training.ts              # plano semanal e execução
│   └── champions.ts             # draft (ban/pick), lista de campeões
├── engine/
│   ├── simulation.ts            # simulação em 3 fases (early/mid/late) — retorna SimulationResult
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
└── data_historico.json

scripts/
└── download-champions.mjs       # baixa ícones DDragon para public/champions/
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
- **Gameplay:** simulação em 3 fases com minimapa animado + log de eventos
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

interface Player {
  id, name, nickname, role: Role
  stats: { farm, mechanics, teamfight }  // 1–10
  champPool: { championId, knowledge }[] // knowledge 0–100
  popularity, moral, fatigue             // 0–100
}

interface AITeam {
  id, name, archetype
  roster: Player[]              // populado pelo snake draft
  preferredPlayerIds: string[]  // IDs preferidos em ordem top/jg/mid/adc/sup
}

interface Match {
  id, teamA, teamB, winner?
  format: 'bo3' | 'bo5'
  bracket: 'winners' | 'losers' | 'grand_final'
  round: number
}

type GameState.phase = 'setup' | 'training' | 'champselect' | 'gameplay' | 'tournament' | 'gameover' | 'victory'

// Tipos da simulação 3 fases
interface SimulationResult extends GameResult {
  phases: PhaseResult[]
  eventMeta: GameEventMeta[]      // metadados por evento (type, phase, combats, etc.)
  finalGold: { player, opponent }
  finalKills: { player, opponent }
  dragonWins: { player, opponent }
  baronWinner: 'player' | 'opponent' | null
}
```

## Simulação em 3 Fases (`engine/simulation.ts`)

`simulateGame(...)` retorna `SimulationResult`. Fases sequenciais:

| Fase | Turnos | Mecânica |
|------|--------|----------|
| Early | 15 | Farm + combates 1v1 por role com HP e kills |
| Mid | 20 | Farm + dragões (turnos 6/13) + barão (turno 18) |
| Late | até 10 | 5 sub-rolls por turno; vence quem ganhar 3 turnos |

Multiplicadores do jogador:
```
knowledgeMult = 0.5 + 0.5 * (knowledge / 100)
fatigueMult   = 1 - fatigue / 200
moralMult     = 0.8 + moral / 500
goldMult      = min(1.3, 1 + totalGold/15000 * 0.3)
```

Cada evento carrega `GameEventMeta` com `type` (`phase_header | kill | dragon | baron | late_turn_won | ...`), `phase` e array `combats` — usado pelo `RiftMap` para animar ícones.

## RiftMap (`components/gameplay/RiftMap.vue`)

Minimapa 500×500px com fundo `/public/minimap.png`. Camadas:
1. Imagem de fundo
2. Indicadores de barão/dragão (círculos com stacks coloridas)
3. Torres (SVG de torre, azul/vermelho, 6 player + 6 opponent)
4. Ícones dos campeões (posicionados por role, animações de combate)

**Animações**: `flash-hit` (dano), `flash-kill` (morte + grayscale), HP bar no early game.

**Drag mode** (dev): `__debugMapPositions()` no console ativa arrastar ícones e torres; chamar de novo imprime todas as coordenadas formatadas prontas para colar no código.

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
- Stores usam Options API do Pinia (`defineStore({ state, getters, actions })`)
- `_save()` é chamado manualmente no final de cada action que muta estado persistido
- Não adicionar `console.log` de debug em produção
- Imagens de campeões não são commitadas — ficam em `public/champions/` (no `.gitignore`)
- `.claude/` está no `.gitignore` (memória local do Claude Code, não commitar)
- `public/minimap.png` não é commitado (no `.gitignore`)
