'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const RelationshipGraph = dynamic(
    () => import('@/components/RelationshipGraph'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[700px] bg-[#0d0905] rounded-xl border-2 border-amber-900/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-t-2 border-amber-600 border-solid rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-amber-900/60 font-serif italic tracking-widest">Consulting the Royal Archive...</p>
                </div>
            </div>
        ),
    }
)

const formatRelation = (type: string) => {
    const map: Record<string, string> = {
        parent: "Parent of",
        child: "Child of",
        sibling: "Sibling of",
        spouse: "Spouse of",
        mentor: "Mentor of",
        ally: "Ally",
        rival: "Rival"
    };
    return map[type] || type;
};

interface Character {
    _id: string
    name: string
    type: string
    role?: string
    imageUrl?: string
    alignment?: string      // Added from Schema
    status?: string         // Added from Schema
    race?: string           // Added from Schema
    class?: string          // Added from Schema
    personalityTraits?: string[]
    factions?: Array<{ name: string }>; // Added from Schema
    homeLocation?:  { _ref: string; name?: string }
    currentLocation?: { _ref: string; name?: string }
    relationships?: Array<{
        target: { _id?: string; _ref?: string; name?: string };
        relationType: 'parent' | 'child' | 'sibling' | 'spouse' | 'ally' | 'rival' | 'mentor';
    }>
}

interface RelationshipGraphWrapperProps {
    characters: Character[]
    highlightCharacter?: string
}

export default function RelationshipGraphWrapper({ characters, highlightCharacter }: RelationshipGraphWrapperProps) {
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
        characters.find(c => c.name === highlightCharacter) || null
    )
    const [lastLocationId, setLastLocationId] = useState<string | null>(null)

    const handleNodeClick = (characterName: string, locationId?: string) => {
        if (!characterName || characterName === '') {
            setSelectedCharacter(null)
            setLastLocationId(null)
            return
        }
        const charObj = characters.find(c => c.name === characterName)
        setSelectedCharacter(charObj || null)
        if (locationId) setLastLocationId(locationId)
    }

    return (
        <>
            {selectedCharacter && (
                <div className="fixed top-24 right-8 bottom-8 z-50 w-80 animate-in slide-in-from-right-8 duration-500">
                    <div className="flex flex-col h-full bg-[#0d0905]/95 backdrop-blur-md border-2 border-amber-900/50 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">

                        {/* 1. Header / Portrait Section */}
                        <div className="relative h-56 shrink-0 bg-gradient-to-t from-[#1a120b] to-transparent p-6 flex flex-col justify-end">
                            <button
                                onClick={() => setSelectedCharacter(null)}
                                className="absolute top-4 right-4 text-amber-900 hover:text-amber-500 transition-colors text-xl"
                            >✕</button>

                            {/* Status Badge */}
                            {selectedCharacter.status && selectedCharacter.status !== 'active' && (
                                <div className="absolute top-6 left-6">
                                    <span className="bg-red-900/80 text-red-200 text-[8px] px-2 py-0.5 rounded border border-red-700 uppercase font-bold tracking-tighter">
                                        {selectedCharacter.status}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full border-2 border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.3)] overflow-hidden bg-black shrink-0">
                                    <img
                                        src={selectedCharacter.imageUrl || '/images/textures/profile-pic.png'}
                                        alt={selectedCharacter.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-amber-100 font-serif text-2xl truncate leading-tight">
                                        {selectedCharacter.name}
                                    </h3>
                                    <p className="text-amber-600 uppercase text-[10px] tracking-widest font-bold">
                                        {selectedCharacter.role || `${selectedCharacter.race} ${selectedCharacter.class}`}
                                    </p>
                                    <p className="text-amber-200/40 text-[9px] italic mt-0.5 italic lowercase">
                                        {selectedCharacter.alignment}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-amber-900">

                            {/* Kinship Section */}
                            <div>
                                <h4 className="text-amber-700 uppercase text-[9px] tracking-[0.2em] font-black mb-3 border-b border-amber-900/30 pb-1">
                                    Kinship & Ties
                                </h4>
                                <div className="space-y-2">
                                    {selectedCharacter.relationships?.map((rel, i) => (
                                        <div key={i}
                                             className="flex justify-between items-center text-xs group cursor-default">
                                            <span className="text-amber-200/40 italic capitalize">{formatRelation(rel.relationType)}</span>
                                            <span
                                                className="text-amber-100 font-medium group-hover:text-amber-400 transition-colors">
                                                {rel.target?.name || "Unknown"}
                                            </span>
                                        </div>
                                    ))}
                                    {(!selectedCharacter.relationships || selectedCharacter.relationships.length === 0) && (
                                        <p className="text-xs text-amber-900/50 italic">No recorded connections.</p>
                                    )}
                                </div>
                            </div>

                            {/* Personality traits */}
                            {selectedCharacter.personalityTraits && selectedCharacter.personalityTraits.length > 0 && (
                                <div>
                                    <h4 className="text-amber-700 uppercase text-[9px] tracking-[0.2em] font-black mb-2 border-b border-amber-900/30 pb-1">
                                        Traits
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedCharacter.personalityTraits.map(trait => (
                                            <span key={trait} className="px-2 py-0.5 bg-amber-950/20 border border-amber-900/40 rounded text-[10px] text-amber-500 font-serif">
                                                {trait}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Factions Section */}
                            {selectedCharacter.factions && selectedCharacter.factions.length > 0 && (
                                <div>
                                    <h4 className="text-amber-700 uppercase text-[9px] tracking-[0.2em] font-black mb-2 border-b border-amber-900/30 pb-1">
                                        Affiliations
                                    </h4>
                                    <div className="space-y-1">
                                        {selectedCharacter.factions.map((faction, i) => (
                                            <p key={i} className="text-[11px] text-amber-200/70 flex items-center gap-2">
                                                <span className="text-amber-600">◈</span> {faction.name}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Footer Action (Location) */}
                        <div className="p-4 bg-amber-950/20 border-t border-amber-900/30 space-y-4">

                            {/* Home Location */}
                            {selectedCharacter.homeLocation?.name && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-blue-900/10 flex items-center justify-center text-lg border border-blue-900/30">
                                        🏠
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-blue-700 uppercase font-bold">Origin / Home</p>
                                        <p className="text-xs text-amber-100/80 truncate w-48">
                                            {selectedCharacter.homeLocation.name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Current Location */}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-amber-900/20 flex items-center justify-center text-lg border border-amber-900/30">
                                    📍
                                </div>
                                <div>
                                    <p className="text-[9px] text-amber-700 uppercase font-bold">Last Known Location</p>
                                    <p className="text-xs text-amber-200 truncate w-48 font-medium">
                                        {selectedCharacter.currentLocation?.name || "Unknown Lands"}
                                    </p>
                                </div>
                            </div>

                            {/* Track Button */}
                            {selectedCharacter.currentLocation && (
                                <button
                                    className="w-full bg-amber-700/10 hover:bg-amber-700/30 border border-amber-700/50 text-amber-200 text-[10px] uppercase py-2.5 transition-all tracking-[0.2em] font-bold rounded shadow-sm active:scale-[0.98]"
                                    onClick={() => console.log("Locate:", selectedCharacter.currentLocation?._ref)}
                                >
                                    Track on Map
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <RelationshipGraph
                key={highlightCharacter || 'default'}
                characters={characters}
                onNodeClick={handleNodeClick}
                highlightNode={highlightCharacter}
            />
        </>
    )
}