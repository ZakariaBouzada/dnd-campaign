export interface Character {
    name: string
    role: string | null
    type: 'PC' | 'NPC' | 'Ally' | 'Antagonist'
    race: string | null
    class: string | null
    hp: number | null
    ac: number | null
    traits: string[]
    backstory: string | null
    location: {
        name: string
    } | null
    seasons: Array<{
        seasonNumber: number
        title: string
    }> | null
}