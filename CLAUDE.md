# CBlow Simulator — CLAUDE.md

Simulador web de gerenciamento esportivo baseado no CBLOL. O jogador é um Manager que recruta jogadores, treina o time e compete em um torneio de dupla eliminação. Roda 100% offline no browser.

## Comandos

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # type-check + build de produção
npm run preview  # preview do build
```

## Stack

- **Vue 3** (Composition API + `<script setup>`)
- **Pinia** — estado global (4 stores)
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
│   ├── players.ts               # 23 jogadores CBLOL com stats
│   ├── coaches.ts               # 4 coaches com bônus
│   ├── teams.ts                 # 7 times de IA
│   ├── championPositions.ts     # mapa campeão → roles (DDragon)
│   └── trainingActions.ts       # metadados das ações de treino (fonte única)
├── stores/
│   ├── game.ts                  # fase do jogo, semana, scores da série
│   ├── team.ts                  # elenco do player, coach, budget
│   ├── tournament.ts            # bracket de dupla eliminação
│   ├── training.ts              # plano semanal e execução
│   └── champions.ts             # draft (ban/pick), lista de campeões
├── engine/
│   ├── simulation.ts            # simulação de partida
│   ├── ai-draft.ts              # lógica de ban/pick da IA
│   └── ai-team.ts               # acesso aos times de IA
├── components/
│   ├── champion-select/         # componentes do draft (portados do lol-champion-select)
│   ├── shared/PlayerCard.vue
│   ├── training/TrainingAction.vue
│   ├── tournament/BracketView.vue
│   └── gameplay/GameLog.vue
├── views/                       # uma view por rota
├── composables/useTimer.ts
└── utils/
    ├── storage.ts               # loadFromStorage<T> / saveToStorage<T>
    └── championImages.ts        # fallback DDragon para imagens
```

## Game loop

```
/ (Home) → /setup → /tournament → /training → /champselect → /gameplay → /tournament → ...
                                                                              └── /gameover ou vitória
```

- **Setup:** nome do time → escolha de coach → escolha de 5 jogadores (budget $10.000)
- **Tournament:** bracket visual, simula partidas de IA, define próxima partida do player
- **Training:** cada jogador recebe uma ação semanal, salários são pagos
- **ChampSelect:** player controla um lado (blue/red alternando), IA controla o outro
- **Gameplay:** simulação automática com log de eventos e barra de vantagem
- A série (Bo3/Bo5) repete ChampSelect → Gameplay até ter vencedor
- Derrota na Losers → `/gameover`; vitória na Grand Final → tela de vitória

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
  salary, popularity, moral, fatigue     // 0–100
}

interface Match {
  id, teamA, teamB, winner?
  format: 'bo3' | 'bo5'
  bracket: 'winners' | 'losers' | 'grand_final'
  round: number
}

type GameState.phase = 'setup' | 'training' | 'champselect' | 'gameplay' | 'tournament' | 'gameover' | 'victory'
```

## Fórmulas de simulação (`engine/simulation.ts`)

```
conhecimento_efetivo = 0.5 + 0.5 * (knowledge / 100)   // conhecimento 0 → 50%, 100 → 100%
poder_jogador = baseStats * conhecimento_efetivo * (1 - fatigue/200) * (0.8 + moral/500)
poder_time    = média(5 jogadores) * random(0.85–1.15)
```

Pesos por role: `top/mid` — Mecânica domina (0.4); `adc` — Farm+Mecânica (0.4+0.4); `support` — TeamFight domina (0.6).

## Bracket de dupla eliminação

8 times. IDs dos matches:
- Winners: `wb_r1_0..3`, `wb_r2_0..1`, `wb_final`
- Losers: `lb_r1_0..3`, `lb_r2_0..1`, `lb_r3_0..1`, `lb_final`
- Grand Final: `grand_final`

Propagação centralizada em `tournament._propagate()` — tabela de rotas `routes[bracket_round]`.

## Champion Select

Portado de `lol-champion-select` para `src/components/champion-select/`.
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
