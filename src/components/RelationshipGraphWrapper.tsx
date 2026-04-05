'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

const RelationshipGraph = dynamic(
    () => import('@/components/RelationshipGraph'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Loading relationship graph...</p>
            </div>
        ),
    }
)

interface Character {
    _id: string
    name: string
    type: string
    role?: string
    family?: { name: string }[]
    allies?: { name: string }[]
    rivals?: { name: string }[]
}

interface RelationshipGraphWrapperProps {
    characters: Character[]
    highlightCharacter?: string
}

export default function RelationshipGraphWrapper({ characters, highlightCharacter }: RelationshipGraphWrapperProps) {
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(highlightCharacter || null)

    // Update selected character when highlightCharacter changes
    useEffect(() => {
        if (highlightCharacter) {
            setSelectedCharacter(highlightCharacter)
        }
    }, [highlightCharacter])

    const handleNodeClick = (characterName: string) => {
        setSelectedCharacter(characterName)
        console.log(`Clicked: ${characterName}`)
    }

    return (
        <>
            {selectedCharacter && (
                <div className="fixed bottom-4 left-4 z-50 bg-black/90 border border-amber-500 rounded-lg p-3 text-sm">
                    <p className="text-amber-400">Selected: {selectedCharacter}</p>
                    <button
                        onClick={() => setSelectedCharacter(null)}
                        className="text-xs text-gray-500 hover:text-amber-400 mt-1"
                    >
                        Close
                    </button>
                </div>
            )}
            <RelationshipGraph
                characters={characters}
                onNodeClick={handleNodeClick}
                highlightNode={highlightCharacter}
            />
        </>
    )
}