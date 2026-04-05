'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

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
                                   mapImage = '/images/maps/generic-map.png',
                                   locations,
                                   onLocationClick
                               }: CK3MapProps) {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
    const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
    const [zoomScale, setZoomScale] = useState(1)
    const instanceRef = useRef<{ transformState?: { scale: number } } | null>(null)

    const validLocations = locations.filter(loc => loc.coordinates && loc.coordinates.x && loc.coordinates.y)

    const updateZoomScale = useCallback(() => {
        if (instanceRef.current?.transformState?.scale) {
            setZoomScale(instanceRef.current.transformState.scale)
        }
    }, [])

    useEffect(() => {
        if (instanceRef.current) {
            updateZoomScale()
            const interval = setInterval(updateZoomScale, 100)
            return () => clearInterval(interval)
        }
    }, [updateZoomScale])

    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'city': return '#c9a227'
            case 'town': return '#8b6914'
            case 'fortress': return '#a02525'
            case 'forest': return '#4a8a40'
            case 'mountain': return '#6a6a6a'
            default: return '#c9a227'
        }
    }

    const getMarkerSize = () => {
        const size = Math.max(2, Math.min(16, 16 / zoomScale))
        const showBorder = zoomScale < 3
        return {
            width: `${size}px`,
            height: `${size}px`,
            borderWidth: `${Math.max(1, 2 / zoomScale)}px`,
            showBorder
        }
    }

    const markerSize = getMarkerSize()

    return (
        <div className="relative w-full bg-black rounded-lg overflow-hidden border-2 border-amber-800/50 shadow-2xl">
            {/* CK3-style decorative border */}
            <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-amber-600/30"></div>
                <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-amber-600/30"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-amber-600/30"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-amber-600/30"></div>
            </div>

            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={12}
                wheel={{ step: 0.2 }}
                limitToBounds={true}
                panning={{ disabled: false }}
            >
                {({ zoomIn, zoomOut, resetTransform, instance }) => {
                    if (instance && instance !== instanceRef.current) {
                        instanceRef.current = instance
                        updateZoomScale()
                    }

                    return (
                        <>
                            <div className="absolute bottom-4 right-4 z-20 flex gap-2 bg-black/70 rounded-lg p-2 backdrop-blur-sm border border-amber-800/50">
                                <button
                                    onClick={() => {
                                        zoomIn()
                                        setTimeout(updateZoomScale, 50)
                                    }}
                                    className="w-8 h-8 bg-amber-900/50 hover:bg-amber-700 text-amber-400 rounded flex items-center justify-center transition"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => {
                                        zoomOut()
                                        setTimeout(updateZoomScale, 50)
                                    }}
                                    className="w-8 h-8 bg-amber-900/50 hover:bg-amber-700 text-amber-400 rounded flex items-center justify-center transition"
                                >
                                    -
                                </button>
                                <button
                                    onClick={() => {
                                        resetTransform()
                                        setTimeout(updateZoomScale, 50)
                                    }}
                                    className="w-8 h-8 bg-amber-900/50 hover:bg-amber-700 text-amber-400 rounded flex items-center justify-center text-xs transition"
                                >
                                    ↺
                                </button>
                            </div>

                            <div className="absolute bottom-4 left-4 z-20 bg-black/70 px-2 py-1 rounded text-xs text-amber-400 font-mono backdrop-blur-sm border border-amber-800/50">
                                {Math.round(zoomScale * 100)}%
                            </div>

                            <TransformComponent>
                                <div className="relative w-full">
                                    <img
                                        src={mapImage}
                                        alt="Campaign Map"
                                        className="w-full h-auto select-none"
                                        draggable={false}
                                        style={{ pointerEvents: 'none' }}
                                    />

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
                                                onMouseEnter={() => setHoveredLocation(location.name)}
                                                onMouseLeave={() => setHoveredLocation(null)}
                                                onClick={() => {
                                                    setSelectedLocation(location)
                                                    onLocationClick?.(location)
                                                }}
                                            >
                                                {zoomScale < 4 && (
                                                    <div
                                                        className="absolute inset-0 rounded-full animate-ping opacity-75"
                                                        style={{
                                                            backgroundColor: getMarkerColor(location.type),
                                                            width: markerSize.width,
                                                            height: markerSize.height,
                                                            borderRadius: '50%'
                                                        }}
                                                    />
                                                )}

                                                <div
                                                    className="relative rounded-full shadow-lg transition-all duration-200 group-hover:scale-150"
                                                    style={{
                                                        width: markerSize.width,
                                                        height: markerSize.height,
                                                        backgroundColor: getMarkerColor(location.type),
                                                        border: markerSize.showBorder ? `${markerSize.borderWidth} solid #fff` : 'none',
                                                        boxShadow: markerSize.showBorder ? '0 0 4px rgba(0,0,0,0.5)' : '0 0 2px rgba(0,0,0,0.3)'
                                                    }}
                                                />

                                                {zoomScale > 0.8 && (
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/90 text-amber-400 text-xs px-3 py-1 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-l-2 border-amber-500 font-serif shadow-lg">
                                                        <span className="mr-1">
                                                            {location.type === 'city' ? '🏰' : location.type === 'fortress' ? '⚔️' : '📍'}
                                                        </span>
                                                        {location.name}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TransformComponent>
                        </>
                    )
                }}
            </TransformWrapper>

            <div className="absolute top-4 left-4 z-10 w-16 h-16 bg-black/60 rounded-full border border-amber-600/50 flex items-center justify-center backdrop-blur-sm">
                <div className="relative w-12 h-12">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-amber-400 text-xl">⬆️</div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-gray-500 text-sm">⬇️</div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 text-sm">⬅️</div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 text-sm">➡️</div>
                    <div className="absolute inset-0 flex items-center justify-center text-amber-600 text-xs">N</div>
                </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 px-3 py-1 rounded border border-amber-800/50 text-xs text-amber-500 font-mono backdrop-blur-sm">
                <span>0</span>
                <span className="mx-2">|</span>
                <span>50</span>
                <span className="mx-2">|</span>
                <span>100 mi</span>
            </div>

            {selectedLocation && (
                <div className="absolute top-20 right-4 z-20 w-72 bg-black/95 border-l-2 border-t-2 border-amber-600/50 rounded-tl-lg p-4 backdrop-blur-md shadow-2xl">
                    <button
                        onClick={() => setSelectedLocation(null)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-amber-400 transition"
                    >
                        ✕
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getMarkerColor(selectedLocation.type) }}
                        />
                        <h4 className="text-amber-400 font-serif text-lg">{selectedLocation.name}</h4>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed">
                        {selectedLocation.description || 'No description available.'}
                    </p>

                    {selectedLocation.faction && (
                        <div className="mt-3 pt-2 border-t border-amber-800/30">
                            <p className="text-xs text-amber-500">CONTROLLING FACTION</p>
                            <p className="text-sm text-gray-300" style={{ color: selectedLocation.faction.color }}>
                                {selectedLocation.faction.name}
                            </p>
                        </div>
                    )}

                    <div className="mt-2">
                        <p className="text-xs text-gray-500 capitalize">
                            {selectedLocation.type}
                        </p>
                    </div>
                </div>
            )}

            {hoveredLocation && !selectedLocation && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 bg-black/90 border border-amber-500 rounded px-4 py-1.5 text-sm text-amber-400 font-serif pointer-events-none whitespace-nowrap shadow-lg">
                    {hoveredLocation}
                </div>
            )}
        </div>
    )
}