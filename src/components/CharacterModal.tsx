'use client'

import { SanityCharacter } from '@/types/sanity'
import { urlFor } from '@/lib/sanity'
import Image from 'next/image'

interface CharacterModalProps {
    character: SanityCharacter | null
    isOpen: boolean
    onClose: () => void
}

export default function CharacterModal({ character, isOpen, onClose }: CharacterModalProps) {
    if (!character) return null

    // Helper functions defined INSIDE the component
    const getTypeIcon = (type: string): string => {
        switch (type) {
            case 'PC': return '⚔️'
            case 'NPC': return '👤'
            case 'Ally': return '🤝'
            case 'Antagonist': return '💀'
            default: return '👤'
        }
    }

    const getTypeStyles = (type: string): string => {
        switch (type) {
            case 'PC': return 'bg-amber-900/50 border-amber-600 text-amber-300'
            case 'Ally': return 'bg-green-900/50 border-green-600 text-green-300'
            case 'Antagonist': return 'bg-red-900/50 border-red-600 text-red-300'
            default: return 'bg-gray-800/50 border-gray-600 text-gray-300'
        }
    }

    const getStatusStyles = (status?: string): string => {
        switch (status) {
            case 'deceased': return 'bg-red-900/50 text-red-300 border-red-700'
            case 'retired': return 'bg-gray-700/50 text-gray-400 border-gray-600'
            case 'missing': return 'bg-amber-900/50 text-amber-400 border-amber-700'
            default: return 'bg-green-900/50 text-green-300 border-green-700'
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/90 z-50 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-black border border-amber-800/50 rounded-lg shadow-2xl z-50 transition-all duration-300 ${
                    isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                }`}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="sticky top-4 float-right mr-4 mt-4 w-8 h-8 rounded-full bg-black/50 text-gray-400 hover:text-amber-400 hover:bg-black/70 transition z-10"
                >
                    ✕
                </button>

                {/* Content */}
                <div className="p-6 pt-0">
                    {/* Header with portrait */}
                    <div className="flex gap-6 mb-6 flex-wrap">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-800 to-amber-950 border-2 border-amber-500 flex items-center justify-center text-5xl shadow-xl shrink-0 overflow-hidden">
                            {character.portrait ? (
                                <Image
                                    src={urlFor(character.portrait)?.width(150).height(150).url() ?? ''}
                                    alt={character.name}
                                    width={150}
                                    height={150}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                getTypeIcon(character.type)
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                                <h2 className="text-3xl font-serif text-amber-400">{character.name}</h2>
                                {character.status && character.status !== 'active' && (
                                    <span className={`text-xs px-2 py-1 rounded border ${getStatusStyles(character.status)}`}>
                                        {character.status.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <p className="text-amber-600 mb-2">{character.role || 'Adventurer'}</p>
                            <div className="flex gap-2 flex-wrap">
                                <span className={`text-xs px-2 py-1 rounded border ${getTypeStyles(character.type)}`}>
                                    {character.type}
                                </span>
                                {character.race && (
                                    <span className="text-xs px-2 py-1 border border-amber-800/50 text-gray-400 rounded">
                                        {character.race}{character.subrace ? ` (${character.subrace})` : ''}
                                    </span>
                                )}
                                {character.class && (
                                    <span className="text-xs px-2 py-1 border border-amber-800/50 text-gray-400 rounded">
                                        {character.class}{character.subclass ? ` (${character.subclass})` : ''}
                                    </span>
                                )}
                                {character.background && (
                                    <span className="text-xs px-2 py-1 border border-amber-800/50 text-gray-400 rounded">
                                        {character.background}
                                    </span>
                                )}
                                {character.alignment && (
                                    <span className="text-xs px-2 py-1 border border-amber-800/50 text-gray-400 rounded">
                                        {character.alignment}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Physical Appearance */}
                    {(character.age || character.height || character.weight || character.eyeColor || character.hairColor) && (
                        <div className="mb-6">
                            <h3 className="text-sm font-serif text-amber-500 mb-2 tracking-wider border-b border-amber-800/30 inline-block">PHYSICAL APPEARANCE</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                                {character.age && <div><span className="text-xs text-gray-500 block">AGE</span><div className="text-sm text-gray-300">{character.age}</div></div>}
                                {character.height && <div><span className="text-xs text-gray-500 block">HEIGHT</span><div className="text-sm text-gray-300">{character.height}</div></div>}
                                {character.weight && <div><span className="text-xs text-gray-500 block">WEIGHT</span><div className="text-sm text-gray-300">{character.weight}</div></div>}
                                {character.eyeColor && <div><span className="text-xs text-gray-500 block">EYES</span><div className="text-sm text-gray-300">{character.eyeColor}</div></div>}
                                {character.hairColor && <div><span className="text-xs text-gray-500 block">HAIR</span><div className="text-sm text-gray-300">{character.hairColor}</div></div>}
                            </div>
                            {character.distinguishingMarks && (
                                <p className="text-xs text-gray-500 mt-2">{character.distinguishingMarks}</p>
                            )}
                        </div>
                    )}

                    {/* Personality Traits */}
                    {character.personalityTraits && character.personalityTraits.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-serif text-amber-500 mb-2 tracking-wider border-b border-amber-800/30 inline-block">PERSONALITY TRAITS</h3>
                            <div className="flex gap-2 flex-wrap mt-3">
                                {character.personalityTraits.map((trait: string) => (
                                    <span key={trait} className="text-xs px-3 py-1 border border-amber-700/50 text-amber-400 rounded-full">
                                        {trait}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ideals, Bonds, Flaws */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {character.ideals && character.ideals.length > 0 && (
                            <div>
                                <h3 className="text-xs font-serif text-amber-500 mb-1 tracking-wider">IDEALS</h3>
                                <ul className="list-disc list-inside text-gray-400 text-sm">
                                    {character.ideals.map((ideal: string) => (
                                        <li key={ideal}>{ideal}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {character.bonds && character.bonds.length > 0 && (
                            <div>
                                <h3 className="text-xs font-serif text-amber-500 mb-1 tracking-wider">BONDS</h3>
                                <ul className="list-disc list-inside text-gray-400 text-sm">
                                    {character.bonds.map((bond: string) => (
                                        <li key={bond}>{bond}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {character.flaws && character.flaws.length > 0 && (
                            <div>
                                <h3 className="text-xs font-serif text-amber-500 mb-1 tracking-wider">FLAWS</h3>
                                <ul className="list-disc list-inside text-gray-400 text-sm">
                                    {character.flaws.map((flaw: string) => (
                                        <li key={flaw}>{flaw}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Backstory */}
                    {character.backstory && (
                        <div className="mb-6">
                            <h3 className="text-sm font-serif text-amber-500 mb-2 tracking-wider border-b border-amber-800/30 inline-block">BACKSTORY</h3>
                            <p className="text-gray-300 text-sm leading-relaxed mt-3 whitespace-pre-wrap">{character.backstory}</p>
                        </div>
                    )}

                    {/* Family & Allies */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {character.family && character.family.length > 0 && (
                            <div>
                                <h3 className="text-xs font-serif text-amber-500 mb-1 tracking-wider">FAMILY</h3>
                                <div className="flex gap-1 flex-wrap">
                                    {character.family.map((member) => (
                                        <span key={member._id} className="text-xs px-2 py-1 bg-amber-900/30 text-amber-400 rounded">
                                            {member.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {character.allies && character.allies.length > 0 && (
                            <div>
                                <h3 className="text-xs font-serif text-amber-500 mb-1 tracking-wider">ALLIES</h3>
                                <div className="flex gap-1 flex-wrap">
                                    {character.allies.map((ally) => (
                                        <span key={ally._id} className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">
                                            {ally.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {character.rivals && character.rivals.length > 0 && (
                            <div>
                                <h3 className="text-xs font-serif text-amber-500 mb-1 tracking-wider">RIVALS</h3>
                                <div className="flex gap-1 flex-wrap">
                                    {character.rivals.map((rival) => (
                                        <span key={rival._id} className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded">
                                            {rival.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Deity & Religion */}
                    {(character.deity || character.religion) && (
                        <div className="mb-6">
                            <h3 className="text-sm font-serif text-amber-500 mb-2 tracking-wider border-b border-amber-800/30 inline-block">FAITH</h3>
                            <div className="flex gap-4 mt-3">
                                {character.deity && <div><span className="text-xs text-gray-500 block">DEITY</span><div className="text-sm text-gray-300">{character.deity}</div></div>}
                                {character.religion && <div><span className="text-xs text-gray-500 block">RELIGION</span><div className="text-sm text-gray-300">{character.religion}</div></div>}
                            </div>
                        </div>
                    )}

                    {/* Factions */}
                    {character.factions && character.factions.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-serif text-amber-500 mb-2 tracking-wider border-b border-amber-800/30 inline-block">FACTIONS & AFFILIATIONS</h3>
                            <div className="flex gap-2 flex-wrap mt-3">
                                {character.factions.map((faction) => (
                                    <span key={faction._id} className="text-xs px-3 py-1 border border-amber-700/50 text-amber-400 rounded-full">
                                        {faction.symbol || '🏛️'} {faction.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Locations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {character.currentLocation && (
                            <div>
                                <h3 className="text-xs font-serif text-amber-500 mb-1 tracking-wider">CURRENT LOCATION</h3>
                                <p className="text-gray-400 text-sm">📍 {character.currentLocation.name}</p>
                            </div>
                        )}
                        {character.homeLocation && (
                            <div>
                                <h3 className="text-xs font-serif text-amber-500 mb-1 tracking-wider">HOMELAND</h3>
                                <p className="text-gray-400 text-sm">🏠 {character.homeLocation.name}</p>
                            </div>
                        )}
                    </div>

                    {/* Seasons */}
                    {character.seasons && character.seasons.length > 0 && (
                        <div>
                            <h3 className="text-sm font-serif text-amber-500 mb-2 tracking-wider border-b border-amber-800/30 inline-block">SEASONS</h3>
                            <div className="flex gap-2 flex-wrap mt-3">
                                {character.seasons.map((season) => (
                                    <span key={season.seasonNumber} className="text-xs px-2 py-1 bg-amber-900/30 text-amber-400 rounded">
                                        Season {season.seasonNumber}: {season.title}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}