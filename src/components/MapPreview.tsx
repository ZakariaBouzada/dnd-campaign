'use client'

interface MapPreviewProps {
    mapImage: string
    locations: any[]
    factions: any[]
}

export default function MapPreview({ mapImage, locations, factions }: MapPreviewProps) {
    // Filter polygon territories
    const polygonTerritories = factions.filter(f =>
        f.territoryData?.polygonPoints && f.territoryData.polygonPoints.length >= 3
    )

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Base Map */}
            <img
                src={mapImage}
                alt="Map"
                className="absolute inset-0 w-full h-full object-cover opacity-50"
            />

            {/* Territories (static, no hover) */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full">
                {polygonTerritories.map((faction) => (
                    <polygon
                        key={faction._id}
                        points={faction.territoryData.polygonPoints.map((p: any) => `${p.x} ${p.y}`).join(', ')}
                        fill={faction.color ? `${faction.color}40` : '#c9a22740'}
                        stroke={faction.color || '#c9a227'}
                        strokeWidth="0.5"
                    />
                ))}
            </svg>

            {/* Location Markers */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full">
                {locations.map((loc, idx) => (
                    loc.coordinates && (
                        <circle
                            key={idx}
                            cx={loc.coordinates.x}
                            cy={loc.coordinates.y}
                            r="1.5"
                            fill="#c9a227"
                        />
                    )
                ))}
            </svg>
        </div>
    )
}