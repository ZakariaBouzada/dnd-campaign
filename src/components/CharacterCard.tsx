'use client'

import { SanityCharacter } from '@/types/sanity'
import { urlFor } from '@/lib/sanity'
import Image from 'next/image'

interface CharacterCardProps {
    char: SanityCharacter
    onClick?: () => void
}

export default function CharacterCard({ char, onClick }: CharacterCardProps) {
    // Helper to get character type icon (fallback if no portrait)
    const getTypeIcon = (type: string): string => {
        switch (type) {
            case 'PC': return '⚔️'
            case 'NPC': return '👤'
            case 'Ally': return '🤝'
            case 'Antagonist': return '💀'
            default: return '👤'
        }
    }

    // Helper to get character type styles
    const getTypeStyles = (type: string): string => {
        switch (type) {
            case 'PC': return 'bg-amber-900/50 border-amber-600 text-amber-300'
            case 'Ally': return 'bg-green-900/50 border-green-600 text-green-300'
            case 'Antagonist': return 'bg-red-900/50 border-red-600 text-red-300'
            default: return 'bg-gray-800/50 border-gray-600 text-gray-300'
        }
    }

    // Get portrait URL if exists (with null check)
    const portraitUrl = char.portrait
        ? urlFor(char.portrait)?.width(200).height(200).url() ?? null
        : null

    return (
        <div
            onClick={onClick}
            className="group bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg overflow-hidden hover:border-amber-600/50 transition-all hover:translate-y-[-4px] cursor-pointer"
        >
            {/* Portrait Area */}
            <div className="relative h-32 bg-gradient-to-b from-amber-950/20 to-transparent">
                <div className="absolute -bottom-8 left-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-800 to-amber-950 border-2 border-amber-600 flex items-center justify-center text-3xl shadow-lg overflow-hidden">
                        {portraitUrl ? (
                            <Image
                                src={portraitUrl}
                                alt={char.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-3xl">{getTypeIcon(char.type)}</span>
                        )}
                    </div>
                </div>
                <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded border ${getTypeStyles(char.type)}`}>
                        {char.type}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 pt-10">
                <h3 className="text-xl font-serif text-amber-400">{char.name}</h3>
                <p className="text-sm text-amber-600/80 mb-2">{char.role || 'Adventurer'}</p>

                {/* Race & Class */}
                <div className="flex gap-3 mb-3 text-xs">
                    {char.race && <span className="text-gray-400">{char.race}{char.subrace ? ` (${char.subrace})` : ''}</span>}
                    {char.class && <span className="text-gray-400">{char.class}{char.subclass ? ` (${char.subclass})` : ''}</span>}
                </div>

                {/* Status */}
                {char.status && char.status !== 'active' && (
                    <div className="mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                            char.status === 'deceased' ? 'bg-red-900/50 text-red-300' :
                                char.status === 'retired' ? 'bg-gray-700/50 text-gray-400' :
                                    'bg-amber-900/50 text-amber-400'
                        }`}>
                            {char.status.toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Personality Traits (show first 2) */}
                {char.personalityTraits && char.personalityTraits.length > 0 && (
                    <div className="flex gap-1 mb-3 flex-wrap">
                        {char.personalityTraits.slice(0, 2).map((trait: string) => (
                            <span key={trait} className="text-xs px-2 py-0.5 border border-amber-800/50 text-amber-500/80 rounded">
                                {trait}
                            </span>
                        ))}
                    </div>
                )}

                {/* Current Location */}
                {char.currentLocation && (
                    <div className="mt-3 pt-2 border-t border-amber-800/20">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>📍</span> {char.currentLocation.name}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}