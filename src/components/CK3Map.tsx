'use client'

import { useState } from 'react'

interface Location {
    _id: string
    name: string
    type: string
    description?: string
    coordinates?: { x: number; y: number }
    faction?: { name: string; color: string }
}

interface CK3MapProps {
    mapImage?: string
    locations: Location[]
    onLocationClick?: (location: Location) => void
}

export default function CK3Map({
                                   mapImage = '/images/maps/TestMapfordnd.png',
                                   locations,
                                   onLocationClick
                               }: CK3MapProps) {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

    // Filter locations that have coordinates
    const validLocations = locations.filter(loc => loc.coordinates && loc.coordinates.x && loc.coordinates.y)

    return (
        <div className="relative w-full bg-black rounded-lg overflow-hidden border-2 border-amber-800/50">
            {/* Map Container */}
            <div className="relative">
                <img
                    src={mapImage}
                    alt="Campaign Map"
                    className="w-full h-auto"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
                />

                {/* Location Markers */}
                <div className="absolute top-0 left-0 w-full h-full">
                    {validLocations.map((location) => (
                        <div
                            key={location._id}
                            className="absolute cursor-pointer group"
                            style={{
                                left: `${(location.coordinates!.x / 800) * 100}%`,
                                top: `${(location.coordinates!.y / 600) * 100}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                            onClick={() => {
                                setSelectedLocation(location)
                                onLocationClick?.(location)
                            }}
                        >
                            {/* Marker dot */}
                            <div className="w-4 h-4 bg-amber-500 rounded-full border border-amber-900 shadow-lg group-hover:w-5 group-hover:h-5 group-hover:bg-amber-400 transition-all" />

                            {/* Location label */}
                            <div className="absolute left-5 top-0 whitespace-nowrap bg-black/80 text-amber-400 text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {location.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Location Panel */}
            {selectedLocation && (
                <div className="absolute bottom-4 right-4 z-10 w-64 bg-black/95 border-l-2 border-t-2 border-amber-600/50 rounded-tl-lg p-3 backdrop-blur-md">
                    <button
                        onClick={() => setSelectedLocation(null)}
                        className="absolute top-1 right-2 text-gray-500 hover:text-amber-400"
                    >
                        ✕
                    </button>
                    <h4 className="text-amber-400 font-serif text-sm">{selectedLocation.name}</h4>
                    <p className="text-gray-400 text-xs mt-1">{selectedLocation.description || 'No description'}</p>
                    {selectedLocation.faction && (
                        <p className="text-gray-500 text-xs mt-1" style={{ color: selectedLocation.faction.color }}>
                            {selectedLocation.faction.name}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}