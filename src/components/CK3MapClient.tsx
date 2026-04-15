'use client'

import dynamic from 'next/dynamic'

// Dynamically import the map component (only works in client component)
const CK3Map = dynamic(
    () => import('@/components/CK3Map'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Loading map...</p>
            </div>
        ),
    }
)

interface Location {
    _id: string
    name: string
    type: string
    description?: string
    coordinates?: { x: number; y: number }
    faction?: { name: string; color: string }
}

interface Faction {
    _id: string
    name: string
    symbol?: string
    color?: string
    tagline?: string
    goals?: string
    territoryData?: {
        type: 'polygon' | 'arrow'
        polygonPoints?: { x: number; y: number }[]
        arrowDirection?: string
        offMapLabel?: string
    }
}

interface CK3MapClientProps {
    mapImage?: string
    locations: Location[]
    factions? : Faction[]
    onLocationClick?: (location: Location) => void
    preview?: boolean
}

export default function CK3MapClient({ mapImage, locations, factions, onLocationClick, preview }: CK3MapClientProps) {
    return <CK3Map mapImage={mapImage} locations={locations} factions={factions} onLocationClick={onLocationClick} preview={preview} />
}