# CBlow Simulator

Simulador web de gerenciamento esportivo inspirado no **CBLOL Bronze** — a liga fictícia de baixo elo do cenário competitivo brasileiro de League of Legends.

Você é o Manager: recrute jogadores via snake draft, treine seu time semana a semana e dispute um torneio de dupla eliminação contra 7 times de IA.

**Roda 100% offline no browser, sem backend, sem instalação.**

---

## Como jogar

```
Setup → Snake Draft → Torneio → Treino → Champion Select → Partida → ...
```

1. **Setup** — dê um nome ao seu time e escolha um coach com bônus únicos
2. **Snake Draft** — 8 times (você + 7 IA sorteados) draftam jogadores do mesmo pool em formato snake
3. **Torneio** — bracket de dupla eliminação com 8 times; partidas de IA simuladas automaticamente
4. **Treino** — distribua ações semanais entre seus 5 jogadores (farm, mecânica, estudo de campeão, stream, descanso)
5. **Champion Select** — draft de 20 passos com bans/picks; você controla um lado, a IA controla o outro
6. **Partida** — simulação automática com log de eventos e barra de vantagem

Vença a Grande Final para se tornar campeão do CBlow.

---

## Rodando localmente

**Pré-requisitos:** Node.js 18+

```bash
git clone https://github.com/seu-usuario/cblow-simulator.git
cd cblow-simulator
npm install
npm run dev
```

Outros comandos:

```bash
npm run build    # type-check + build de produção
npm run preview  # preview do build
```

### Imagens de campeões

As imagens não são commitadas no repositório (assets pesados). Para tê-las localmente, baixe via DDragon e coloque em `public/champions/{ChampionId}.png`:

```bash
# Exemplo para baixar todas as imagens (requer curl)
VERSION="15.1.1"  # ajuste para a patch atual
mkdir -p public/champions

# Baixe o arquivo de campeões e extraia os IDs
curl -s "https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/pt_BR/champion.json" \
  | grep -o '"id":"[^"]*"' | sed 's/"id":"//;s/"//' \
  | while read id; do
      curl -s "https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${id}.png" \
           -o "public/champions/${id}.png"
    done
```

O jogo usa fallback automático para o CDN do DDragon se as imagens locais não existirem.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Estado | Pinia |
| Roteamento | Vue Router 4 (hash history) |
| Tipos | TypeScript 5 |
| Estilo | Tailwind CSS 3 + SCSS |
| Build | Vite 5 |
| Persistência | `localStorage` (100% offline) |

---

## Estrutura do projeto

```
src/
├── types/
│   ├── game.types.ts          # todos os tipos do jogo
│   └── championSelect.types.ts
├── data/
│   ├── players.ts             # 23 jogadores com stats e champion pool
│   ├── coaches.ts             # 4 coaches com bônus
│   ├── teams.ts               # 8 times de IA com preferências de draft
│   ├── championPositions.ts   # mapa campeão → roles (DDragon)
│   └── trainingActions.ts     # metadados das ações de treino
├── stores/                    # estado global via Pinia
│   ├── game.ts                # fase do jogo, semana
│   ├── team.ts                # elenco do player, coach, budget
│   ├── tournament.ts          # bracket de dupla eliminação
│   ├── training.ts            # plano semanal
│   └── champions.ts           # draft (ban/pick)
├── engine/
│   ├── simulation.ts          # simulação de partida
│   ├── ai-draft.ts            # lógica de ban/pick da IA
│   └── ai-team.ts             # acesso aos times de IA
├── components/
│   ├── champion-select/       # interface de draft portada do lol-champion-select
│   ├── shared/PlayerCard.vue
│   ├── training/TrainingAction.vue
│   ├── tournament/BracketView.vue
│   └── gameplay/GameLog.vue
├── views/                     # uma view por rota
└── utils/
    ├── storage.ts             # loadFromStorage / saveToStorage
    └── championImages.ts      # fallback DDragon para imagens

data/                          # dados históricos do torneio real que inspirou o jogo
├── data.json                  # estatísticas da temporada (times, jogadores, campeões)
└── data_historico.json        # histórico completo de partidas
```

---

## Fórmulas de simulação

```
conhecimento_efetivo = 0.5 + 0.5 * (knowledge / 100)
poder_jogador        = baseStats * conhecimento_efetivo * (1 - fatigue/200) * (0.8 + moral/500)
poder_time           = média(5 jogadores) * random(0.85–1.15)
```

Pesos por role: `top/mid` — Mecânica (0.4); `adc` — Farm + Mecânica (0.4 + 0.4); `support` — TeamFight (0.6).

---

## Sobre o projeto

O CBlow Simulator é uma homenagem ao **CBlow** — campeonato real de League of Legends de baixo elo organizado pelo streamer **[Yoda](https://kick.com/yoda)** na Kick. Os times e jogadores são baseados nos participantes reais do torneio.

Os arquivos em `/data` contêm as estatísticas reais do campeonato que inspirou o jogo.

---

## Contribuindo

PRs são bem-vindos! Algumas ideias de contribuição:

- Novos times e jogadores
- Mais ações de treino
- Melhorias na simulação de partidas
- Novos formatos de torneio
- UI/UX improvements

Abra uma issue antes de começar uma mudança grande para alinharmos a direção.

---

## Licença

MIT — veja [LICENSE](LICENSE) para detalhes.
