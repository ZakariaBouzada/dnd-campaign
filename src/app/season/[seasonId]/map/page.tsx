import { getActiveMapForSeason, getAllLocationsForSeason, getAllFactionsForSeason } from '@/lib/sanityQueries'
import { urlFor } from '@/lib/sanity'
import Link from 'next/link'
import CK3MapClient from '@/components/CK3MapClient'

interface Location {
    _id: string
    name: string
    type: string
    description?: string
    coordinates?: { x: number; y: number }
    faction?: { name: string; color: string }
}

// UPDATED: Matches the multi-arrow structure used in the Client Component
interface Faction {
    _id: string
    name: string
    symbol?: string
    color?: string
    tagline?: string
    goals?: string
    territoryData?: {
        type: 'polygon' | 'arrow'
        polygonPoints?: Array<{ x: number; y: number }>
        arrows?: Array<{
            point: { x: number; y: number }
            direction: string
            label?: string
        }>
    }
}

export default async function SeasonMapPage({ params }: { params: Promise<{ seasonId: string }> }) {
    const { seasonId } = await params
    const seasonNumber = parseInt(seasonId)

    // Get season-specific map, locations, and factions
    const activeMap = await getActiveMapForSeason(seasonNumber)
    const locations = await getAllLocationsForSeason(seasonNumber)
    const factions = await getAllFactionsForSeason(seasonNumber)

    console.log(`📍 Locations for season ${seasonNumber}:`, locations.length)
    console.log(`🏰 Factions for season ${seasonNumber}:`, factions.length)

    // Generate optimized image URL with crop applied
    let optimizedMapUrl = '/images/maps/generic-map.png'
    let cropSettings = null

    if (activeMap?.imageAsset) {
        const imageBuilder = urlFor(activeMap.imageAsset)
        if (imageBuilder) {
            let builder = imageBuilder
                .format('webp')
                .width(1920)
                .quality(80)

            // Apply crop using PIXEL values
            if (activeMap.pixelCrop) {
                const pc = activeMap.pixelCrop
                builder = builder.rect(pc.x, pc.y, pc.width, pc.height)
                cropSettings = activeMap.crop
                console.log('Applying pixel crop:', pc)
            }

            optimizedMapUrl = builder.url()
        }
    }

    return (
        <main className="min-h-screen bg-black p-8">
            <div className="max-w-7xl mx-auto">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-amber-800/30">
                    <Link href={`/season/${seasonId}`} className="flex items-center gap-1 text-amber-600 hover:text-amber-400 transition text-sm group">
                        <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
                        <span>Back to Season</span>
                    </Link>
                    <Link href="/" className="text-xs text-gray-500 hover:text-amber-400 transition flex items-center gap-1">
                        <span>🏠</span> Home
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif text-amber-400 mb-2">
                        {activeMap?.name || 'The Realm of Valdris'}
                    </h1>
                    <p className="text-amber-600 text-sm tracking-wider">Season {seasonNumber}</p>
                    {cropSettings && (
                        <p className="text-xs text-gray-500 mt-2">
                            🗺️ Region view
                        </p>
                    )}
                    <div className="w-24 h-px bg-amber-700/50 mx-auto mt-4" />
                </div>

                {/* Map - Client Component */}
                <CK3MapClient
                    mapImage={optimizedMapUrl}
                    locations={locations}
                    factions={factions}
                />

                {/* Legend */}
                <div className="mt-6 flex justify-center gap-6 flex-wrap">
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#c9a227]" />
                        <span>City</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#8b6914]" />
                        <span>Town</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#a02525]" />
                        <span>Fortress</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#4a8a40]" />
                        <span>Forest</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#6a6a6a]" />
                        <span>Mountain</span>
                    </div>
                </div>
            </div>
        </main>
    )
}