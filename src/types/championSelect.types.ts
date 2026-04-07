export type Side = 'blue' | 'red'

export type Phase = 'pick' | 'ban'

export type Position = 'left' | 'right'

export type Champions = ChampionPortrait[]

export type SessionData = {
    bans: {
        blue: string[]
        red: string[]
    }
    picks: {
        blue: string[]
        red: string[]
    }
}

export type ChampionPortrait = {
    name: string
    image: string
}

export type SingleChampion = {
    name: string
    id: string
    tags: string[]
}

export type TeamPicks = {
    side: Side
    champions: Champions
}

export type DraftStep = {
    phase: Phase
    side: Side
}
