'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

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

interface CK3MapWrapperProps {
    seasonId: number
    mapImage?: string
}

export default function CK3MapWrapper({ seasonId, mapImage }: CK3MapWrapperProps) {
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchLocations() {
            try {
                // Dynamic import of Sanity client
                const { client } = await import('@/lib/sanity')

                const query = `*[_type == "location"] {
                    _id,
                    name,
                    type,
                    description,
                    coordinates,
                    faction-> {
                        name,
                        color
                    }
                }`

                const data = await client.fetch(query)
                console.log('Fetched locations:', data)

                // Filter locations that have coordinates
                const validLocations = data.filter((loc: Location) =>
                    loc.coordinates && loc.coordinates.x && loc.coordinates.y
                )
                setLocations(validLocations)
            } catch (error) {
                console.error('Error fetching locations:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchLocations()
    }, [seasonId])

    if (loading) {
        return (
            <div className="h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Loading locations...</p>
            </div>
        )
    }

    return (
        <CK3Map
            mapImage={mapImage}
            locations={locations}
            onLocationClick={(location) => console.log('Clicked:', location.name)}
        />
    )
}