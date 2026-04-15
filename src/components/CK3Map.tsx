'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

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
        polygonPoints?: Array<{ x: number; y: number }>
        arrows?: Array<{
            point: { x: number; y: number }
            direction: string
            label?: string
        }>
    }
}

interface CK3MapProps {
    mapImage?: string
    locations: Location[]
    factions?: Faction[]
    onLocationClick?: (location: Location) => void
    onFactionClick?: (faction: Faction) => void
    preview?: boolean
}

export default function CK3Map({
                                   mapImage = '/images/maps/generic-map.png',
                                   locations,
                                   factions = [],
                                   onLocationClick,
                                   onFactionClick,
                                    preview = false
                               }: CK3MapProps) {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null)
    const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
    const [hoveredFaction, setHoveredFaction] = useState<string | null>(null)
    const [zoomScale, setZoomScale] = useState(1)
    const [maskUrl, setMaskUrl] = useState<string | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [isReady, setIsReady] = useState(false);

    // Data Filtering
    const validLocations = locations.filter(loc => loc.coordinates?.x && loc.coordinates?.y)
    const polygonTerritories = factions.filter(f => {
        const points = f.territoryData?.polygonPoints;
        const hasEnoughPoints = Array.isArray(points) && points.length >= 3;

        // If it's still 0, this log will tell us exactly what the points look like
        if (!hasEnoughPoints && f.name) {
        }

        return hasEnoughPoints;
    });
    const handleTransform = useCallback((ref: { state: { scale: number } }) => {
        setZoomScale(ref.state.scale)
    }, [])

    const getMarkerColor = (type: string) => {
        const colors: Record<string, string> = {
            city: '#c9a227',
            town: '#8b6914',
            fortress: '#a02525',
            forest: '#4a8a40',
            mountain: '#6a6a6a',
        }
        return colors[type] || '#c9a227'
    }

    const markerStyles = {
        width: `${Math.max(4, Math.min(16, 16 / zoomScale))}px`,
        height: `${Math.max(4, Math.min(16, 16 / zoomScale))}px`,
        borderWidth: `${Math.max(1, 2 / zoomScale)}px`,
    }

    // AUTO-MASK LOGIC: Runs once when the mapImage changes
    useEffect(() => {
        let isMounted = true;
        const generateMask = async () => {
            const img = new Image()
            img.crossOrigin = "anonymous" // Critical for Sanity CDN images
            img.src = mapImage

            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                if (!ctx) return

                ctx.drawImage(img, 0, 0)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data

                // Scan every pixel: If it's "not blue enough", make it white (land)
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Check 1: Deep blue water
                    const isDeepWater = b > r && b > g;

                    // Check 2: The "White" ripples.
                    // Even if they are bright, they usually have more Blue (b) than Red (r).
                    // In land (tan/brown), Red is usually HIGHER than Blue.
                    const isRipple = b >= r;

                    // Check 3: Minimum blue threshold (to avoid catching dark shadows on land)
                    const hasBlueComponent = b > 60;

                    // Combine: It's water if it's blue-dominant OR if it's a ripple where blue >= red
                    const isWater = hasBlueComponent && (isDeepWater || isRipple);

                    const color = isWater ? 0 : 255;
                    data[i] = data[i + 1] = data[i + 2] = color;
                    data[i + 3] = 255; // Ensure alpha is full
                }

                ctx.putImageData(imageData, 0, 0)
                setMaskUrl(canvas.toDataURL()) // This is our "Stencil"
                setTimeout(() => setIsReady(true), 50);
            }

        }

        generateMask();
        return () => { isMounted = false; };
    }, [mapImage])

    const getPolygonCenter = (points: Array<{ x: number; y: number }>) => {
        if (!points || points.length === 0) return { x: 0, y: 0 };
        const sumX = points.reduce((sum, p) => sum + p.x, 0);
        const sumY = points.reduce((sum, p) => sum + p.y, 0);
        return {
            x: sumX / points.length,
            y: sumY / points.length
        };
    };

    return (
        <div
            className={`relative w-full bg-black rounded-lg overflow-hidden border-2 border-amber-800/50 shadow-2xl font-serif transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}>

            {/* 1. LAYER: CINEMATIC VIGNETTE
            This provides the "shadow from all around" that sits on top of everything.
        */}
            <div
                className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_120px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(0,0,0,0.7)]"/>

            {/* 2. LAYER: CORNER ACCENTS UI */}
            <div className="absolute inset-0 pointer-events-none z-40">
                <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-amber-600/20"/>
                <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-amber-600/20"/>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-amber-600/20"/>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-amber-600/20"/>
            </div>

            {/* 3. LAYER: SCANLINES
            Adds a subtle 'tactical screen' texture.
        */}
            <div
                className="absolute inset-0 z-30 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,4px_100%]"/>
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit={true}
                limitToBounds={true}
                onTransformed={handleTransform}
                panning={{disabled: !!preview }}  // Disable pan in preview
                wheel={{disabled: !!preview }}   // Disable wheel zoom in preview
                doubleClick={{disabled: !!preview }}
            >
                {({zoomIn, zoomOut, resetTransform}) => (
                    <>
                        <div
                            className="absolute bottom-4 right-4 z-20 flex gap-2 bg-black/80 rounded-lg p-2 border border-amber-800/40 backdrop-blur-md">
                            <button onClick={() => zoomIn()}
                                    className="w-8 h-8 hover:bg-amber-900/40 text-amber-500 rounded transition">+
                            </button>
                            <button onClick={() => zoomOut()}
                                    className="w-8 h-8 hover:bg-amber-900/40 text-amber-500 rounded transition">-
                            </button>
                            <button onClick={() => resetTransform()}
                                    className="w-8 h-8 hover:bg-amber-900/40 text-amber-500 rounded text-xs transition">↺
                            </button>
                        </div>

                        <TransformComponent wrapperStyle={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div className="relative">
                                <img src={mapImage} alt="World Map"
                                     className="w-full h-auto select-none pointer-events-none brightness-[0.85] contrast-[1] saturate-[0.6] sepia-[0.2]" draggable={false}/>

                                <svg viewBox="0 0 100 100" preserveAspectRatio="none"
                                     className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                    <defs>
                                        {/* THE MASK DEFINITION */}
                                        {maskUrl && (
                                            <mask id="land-mask">
                                                <image href={maskUrl} width="100" height="100"
                                                       preserveAspectRatio="none"/>
                                            </mask>
                                        )}
                                    </defs>

                                    {/* GROUP WRAPPED IN MASK: Polygons will "hide" when over black pixels in mask */}
                                    <g mask={maskUrl ? "url(#land-mask)" : undefined}>
                                        {polygonTerritories.map((faction) => (
                                            <polygon
                                                key={faction._id}
                                                points={faction.territoryData?.polygonPoints?.map(p => `${p.x} ${p.y}`).join(', ')}
                                                fill={hoveredFaction === faction.name
                                                    ? `${faction.color}15` // Brighter (20% opacity)
                                                    : `${faction.color}05` // Default (approx 8% opacity)
                                                }
                                                stroke={faction.color || '#c9a227'}
                                                strokeWidth={(hoveredFaction === faction.name ? 0.3 : 0.1) / zoomScale}// Thinned for elegance
                                                className="transition-all duration-500 cursor-pointer pointer-events-auto hover:brightness-125 hover:stroke-[0.1px]"
                                                onMouseEnter={() => setHoveredFaction(faction.name)}
                                                onMouseLeave={() => setHoveredFaction(null)}
                                                onClick={() => {
                                                    setSelectedFaction(faction);
                                                    setSelectedLocation(null);
                                                    onFactionClick?.(faction);
                                                }}
                                            />
                                        ))}
                                    </g>
                                </svg>

                                {factions.map((faction) =>
                                        faction.territoryData?.arrows?.map((arrow, idx) => {
                                            const rotations: Record<string, number> = {
                                                north: 0, northeast: 45, east: 90, southeast: 135,
                                                south: 180, southwest: 225, west: 270, northwest: 315
                                            };

                                            return (
                                                <div
                                                    key={`${faction._id}-arr-${idx}`}
                                                    className="absolute cursor-pointer group z-20 flex flex-col items-center"
                                                    style={{
                                                        left: `${arrow.point.x}%`,
                                                        top: `${arrow.point.y}%`,
                                                        transform: 'translate(-50%, -50%)'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevents map clicks from firing
                                                        setSelectedFaction(faction);
                                                        onFactionClick?.(faction);
                                                    }}
                                                >
                                                    {/* 1. THE SLIMMED CK3 LABEL */}
                                                    {arrow.label && (
                                                        <div className="mb-2 px-2 py-0.5 bg-[#12100d]/90 border-x border-y-[0.5px] border-[#c9a227]/60
                                    text-[#e3dac9] text-[9px] font-serif italic tracking-[0.2em] shadow-xl
                                    uppercase backdrop-blur-sm pointer-events-none">
                        <span className="relative z-10 opacity-90">
                            {arrow.label}
                        </span>
                                                        </div>
                                                    )}

                                                    {/* 2. THE SLIM "BODKIN" ARROW */}
                                                    <div className="transition-all duration-500 group-hover:scale-110 group-hover:brightness-150"
                                                         style={{ transform: `rotate(${rotations[arrow.direction] || 0}deg)` }}>
                                                        <svg width="30" height="50" viewBox="0 0 60 100" className="filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
                                                            <defs>
                                                                {/* Gradient that looks like thinning ink/paint */}
                                                                <linearGradient id={`inkFade-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                                                    <stop offset="0%" stopColor="#f4e4bc" />
                                                                    <stop offset="70%" stopColor="#c9a227" />
                                                                    <stop offset="100%" stopColor="#8a6d1a" stopOpacity="0.6" />
                                                                </linearGradient>
                                                            </defs>

                                                            {/* The Slim Arrow Path (Bodkin Style) */}
                                                            <path
                                                                d="M30 2 L55 35 L35 32 L35 98 L25 98 L25 32 L5 35 Z"
                                                                fill={`url(#inkFade-${idx})`}
                                                                stroke="#2a2212"
                                                                strokeWidth="1.5"
                                                                strokeLinejoin="round"
                                                                style={{ opacity: 0.85 }}
                                                            />

                                                            {/* Weathered "Scuff" Mark - extra detail for that worn look */}
                                                            <line x1="28" y1="50" x2="32" y2="70" stroke="#000" strokeWidth="0.5" opacity="0.3" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )
                                        })
                                )}

                                {polygonTerritories.map((faction) => {
                                    const points = faction.territoryData?.polygonPoints || [];
                                    if (points.length === 0) return null;

                                    const center = getPolygonCenter(points);
                                    const isHovered = hoveredFaction === faction.name;

                                    return (
                                        <div
                                            key={`name-${faction._id}`}
                                            className="absolute pointer-events-none z-10 select-none flex flex-col items-center justify-center"
                                            style={{
                                                left: `${center.x}%`,
                                                top: `${center.y}%`,
                                                transform: 'translate(-50%, -50%)',
                                                opacity: Math.min(1, zoomScale * 0.8),
                                                background: isHovered
                                                    ? 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 90%)'
                                                    : 'radial-gradient(circle, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)',
                                                padding: '30px 60px',
                                            }}
                                        >
                                    <span
                                        className="font-serif italic font-bold tracking-[0.4em] uppercase whitespace-nowrap"
                                        style={{
                                            fontSize: `${Math.max(9, 13 / zoomScale)}px`,
                                            textShadow: isHovered
                                                ? `0px 0px 15px ${faction.color}, 0px 0px 20px ${faction.color}, 0px 2px 4px rgba(0,0,0,1)`
                                                : `0px 2px 4px rgba(0,0,0,1), 0px 0px 10px rgba(0,0,0,0.8)`,
                                            // Text becomes fully opaque on hover
                                            color: isHovered ? '#fff' : `${faction.color}BB`,
                                        }}
                                    >
                                        {faction.name}
                                    </span>
                                        </div>
                                    );
                                })}

                                {validLocations.map((location) => (
                                    <div
                                        key={location._id}
                                        className="absolute cursor-pointer group z-30"
                                        style={{
                                            left: `${location.coordinates!.x}%`,
                                            top: `${location.coordinates!.y}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                        onMouseEnter={() => setHoveredLocation(location.name)}
                                        onMouseLeave={() => setHoveredLocation(null)}
                                        onClick={() => {
                                            setSelectedLocation(location);
                                            setSelectedFaction(null);
                                            onLocationClick?.(location);
                                        }}
                                    >
                                        <div
                                            className="rounded-full shadow-md transition-transform group-hover:scale-150"
                                            style={{
                                                ...markerStyles,
                                                backgroundColor: getMarkerColor(location.type),
                                                border: zoomScale < 4 ? `${markerStyles.borderWidth} solid #fff` : 'none'
                                            }}
                                        />
                                        {zoomScale > 0.8 && (
                                            <div
                                                className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/90 text-amber-400 text-xs px-3 py-1 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity border-l-2 border-amber-500 shadow-lg pointer-events-none">
                                                {location.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
            {/* UI Panels (HUD, Selection) remain as they were... */}
            {/* Bottom HUD */}
            <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 px-4 py-1 rounded-full border border-amber-900/40 text-[10px] text-amber-600/80 tracking-widest backdrop-blur-sm">
                TERRA COGNITA — {Math.round(zoomScale * 100)}%
            </div>

            {/* Floating Selection Tooltip */}
            {(hoveredLocation || hoveredFaction) && !selectedLocation && !selectedFaction && (
                <div
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-black/90 border border-amber-500/50 rounded-md px-4 py-2 text-sm text-amber-400 pointer-events-none shadow-xl backdrop-blur-sm">
                    {hoveredLocation || hoveredFaction}
                </div>
            )}

            {/* Selection Panel */}
            {(selectedLocation || selectedFaction) && (
                <div
                    className="absolute top-20 right-4 z-50 w-80 bg-black/95 border-l-2 border-amber-600/50 rounded-tl-xl p-5 backdrop-blur-lg shadow-2xl animate-in fade-in slide-in-from-right-4">
                    <button onClick={() => {
                        setSelectedLocation(null);
                        setSelectedFaction(null);
                    }} className="absolute top-3 right-3 text-gray-500 hover:text-amber-500 transition">✕
                    </button>

                    <h4 className="text-amber-500 text-xl font-bold mb-3 border-b border-amber-900/50 pb-2">
                        {selectedLocation?.name || selectedFaction?.name}
                    </h4>

                    <p className="text-gray-300 text-sm leading-relaxed italic mb-4">
                        {selectedLocation?.description || selectedFaction?.tagline || 'Records are sparse for this region.'}
                    </p>

                    {selectedFaction?.goals && (
                        <div className="mt-4">
                            <span className="text-[10px] text-amber-700 uppercase font-bold tracking-tighter">Current Ambitions</span>
                            <p className="text-gray-400 text-xs mt-1">{selectedFaction.goals}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}