// Image reference from Sanity
export interface SanityImage {
    _type: 'image'
    asset: {
        _ref: string
        _type: 'reference'
    }
    hotspot?: {
        x: number
        y: number
        height: number
        width: number
    }
    crop?: {
        top: number
        bottom: number
        left: number
        right: number
    }
}

// Faction reference (simplified)
export interface SanityFaction {
    _id: string
    name: string
    symbol?: string
    color?: string
}

// Location reference
export interface SanityLocation {
    _id: string
    name: string
    type?: string
    description?: string
}

// Season reference
export interface SanitySeason {
    _id: string
    seasonNumber: number
    title: string
    description?: string
}

// Character interface with proper types
export interface SanityCharacter {
    _id: string
    name: string
    slug?: {
        current: string
    }
    portrait?: SanityImage
    gallery?: SanityImage[]
    race?: string
    subrace?: string
    class?: string
    subclass?: string
    background?: string
    alignment?: string
    type: 'PC' | 'NPC' | 'Ally' | 'Antagonist'
    role?: string
    status?: 'active' | 'retired' | 'deceased' | 'missing'
    backstory?: string
    personalityTraits?: string[]
    ideals?: string[]
    bonds?: string[]
    flaws?: string[]
    family?: SanityCharacter[]
    allies?: SanityCharacter[]
    rivals?: SanityCharacter[]
    deity?: string
    religion?: string
    factions?: SanityFaction[]
    age?: number
    height?: string
    weight?: string
    eyeColor?: string
    hairColor?: string
    distinguishingMarks?: string
    currentLocation?: SanityLocation
    homeLocation?: SanityLocation
    seasons?: SanitySeason[]
}

// Session interface
export interface SanitySession {
    _id: string
    sessionNumber: number
    season?: SanitySeason
    date?: string
    title?: string
    summary?: string
    keyEvents?: string[]
    charactersPresent?: SanityCharacter[]
    location?: SanityLocation
}

// Faction interface
export interface SanityFactionComplete {
    _id: string
    name: string
    symbol?: string
    color?: string
    tagline?: string
    goals?: string
    territory?: string
    members?: SanityCharacter[]
}

// Location interface
export interface SanityLocationComplete {
    _id: string
    name: string
    type?: string
    description?: string
    coordinates?: {
        x: number
        y: number
    }
    faction?: SanityFaction
    notableNpcs?: SanityCharacter[]
}

export interface Chapter {
    title: string
    content: string
    order?: number
}

export interface TimelineSession {
    sessionNumber: number
    title: string
    summary: string
    date: string
    keyEvents: string[]
    charactersPresent: { name: string }[]
}