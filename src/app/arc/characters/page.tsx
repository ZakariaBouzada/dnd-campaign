import { client } from '@/lib/sanity'
import { SanityCharacter } from '@/types/sanity'
import CharactersClient from '@/components/CharactersClient'
import { Suspense } from 'react'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import BackNavigation from "@/components/BackNavigation";

export const revalidate = 120

async function getAllArcCharacters(): Promise<SanityCharacter[]> {
    // REMOVED: The $seasonId filter so it catches everyone in the Arc
    const query = `*[_type == "character"] | order(name asc) {
        _id,
        name,
        slug,
        portrait,
        gallery,
        race,
        subrace,
        class,
        subclass,
        background,
        alignment,
        type,
        role,
        status,
        backstory,
        personalityTraits,
        ideals,
        bonds,
        flaws,
        family[]-> { _id, name, type },
        allies[]-> { _id, name, type },
        rivals[]-> { _id, name, type },
        deity,
        religion,
        factions[]-> { _id, name, symbol, color },
        age,
        height,
        weight,
        eyeColor,
        hairColor,
        distinguishingMarks,
        currentLocation-> { name , "_ref": _id},
        homeLocation-> { name, "_ref": _id },
        seasons[]-> {
            _id,
            seasonNumber,
            title
        }
    }`

    const characters = await client.fetch(query)
    return characters
}

export default async function GlobalArcCharactersPage() {
    const characters = await getAllArcCharacters()

    return (
        <main className="min-h-screen bg-[#050505] p-8">
            <div className="max-w-7xl mx-auto">
                {/* Updated Navigation to go back to the Arc Summary */}
                <BackNavigation customBackPath="/arc" customBackLabel="Chronicle" />

                <header className="mb-12 text-center">
                    <h1 className="text-5xl font-serif text-amber-400 mb-4 drop-shadow-md">
                        The Great Roster
                    </h1>
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-4" />
                    <p className="text-amber-700/80 italic tracking-wide">
                        The complete directory of souls across all seasons
                    </p>
                </header>

                {characters.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-amber-900/20 rounded-xl">
                        <p className="text-gray-500 font-serif">The archives are currently empty.</p>
                    </div>
                ) : (
                    <Suspense fallback={<LoadingSkeleton />}>
                        {/* REUSING your existing client component for consistency */}
                        <CharactersClient characters={characters} />
                    </Suspense>
                )}
            </div>
        </main>
    )
}