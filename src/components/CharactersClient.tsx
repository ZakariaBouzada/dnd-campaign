'use client'

import { useState } from 'react'
import { SanityCharacter } from '@/types/sanity'
import CharacterCard from './CharacterCard'
import CharacterModal from './CharacterModal'

interface CharactersClientProps {
    characters: SanityCharacter[]
}

export default function CharactersClient({ characters }: CharactersClientProps) {
    const [selectedChar, setSelectedChar] = useState<SanityCharacter | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const openModal = (char: SanityCharacter) => {
        setSelectedChar(char)
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setTimeout(() => setSelectedChar(null), 300)
    }

    if (characters.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No characters found. Add some in Sanity Studio!</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((char) => (
                    <CharacterCard
                        key={char._id}
                        char={char}
                        onClick={() => openModal(char)}
                    />
                ))}
            </div>

            <CharacterModal
                character={selectedChar}
                isOpen={modalOpen}
                onClose={closeModal}
            />
        </>
    )
}