import type { Champion, ChampionPosition } from '@/types/game.types'

const modules = import.meta.glob('./*.json', { eager: true }) as Record<string, Champion>

export const ALL_CHAMPIONS: Champion[] = Object.values(modules)
    .sort((a, b) => a.id.localeCompare(b.id))

/** Record<championId, positions[]> — mantido para compatibilidade */
export const CHAMPION_POSITIONS: Record<string, ChampionPosition[]> =
    Object.fromEntries(ALL_CHAMPIONS.map(c => [c.id, c.positions]))

export const ROLE_ICONS: Record<string, string> = {
    all:     '',
    top:     'https://static.wikia.nocookie.net/leagueoflegends/images/e/ef/Top_icon.png/revision/latest/scale-to-width-down/20?cb=20181117143602',
    jungle:  'https://static.wikia.nocookie.net/leagueoflegends/images/1/1b/Jungle_icon.png/revision/latest/scale-to-width-down/20?cb=20181117143559',
    mid:     'https://static.wikia.nocookie.net/leagueoflegends/images/9/98/Middle_icon.png/revision/latest/scale-to-width-down/20?cb=20181117143644',
    bottom:  'https://static.wikia.nocookie.net/leagueoflegends/images/9/97/Bottom_icon.png/revision/latest/scale-to-width-down/20?cb=20181117143632',
    support: 'https://static.wikia.nocookie.net/leagueoflegends/images/e/e0/Support_icon.png/revision/latest/scale-to-width-down/20?cb=20181117143601',
}

// Re-export do tipo para conveniência
export type { ChampionPosition } from '@/types/game.types'
