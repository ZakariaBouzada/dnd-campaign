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

interface CK3MapClientProps {
    mapImage?: string
    locations: Location[]
    onLocationClick?: (location: Location) => void
}

export default function CK3MapClient({ mapImage, locations, onLocationClick }: CK3MapClientProps) {
    return <CK3Map mapImage={mapImage} locations={locations} onLocationClick={onLocationClick} />
}