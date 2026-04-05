import { client } from '@/lib/sanity'
import { SanityCharacter } from '@/types/sanity'
import CharactersClient from '@/components/CharactersClient'
import { Suspense } from 'react'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import BackNavigation from "@/components/BackNavigation";

export const revalidate = 120

// Add the parameter here - this function now accepts seasonId
async function getCharacters(seasonId: number): Promise<SanityCharacter[]> {
    const query = `*[_type == "character" && $seasonId in seasons[]->.seasonNumber] {
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
        family[]-> {
            _id,
            name,
            type
        },
        allies[]-> {
            _id,
            name,
            type
        },
        rivals[]-> {
            _id,
            name,
            type
        },
        deity,
        religion,
        factions[]-> {
            _id,
            name,
            symbol,
            color
        },
        age,
        height,
        weight,
        eyeColor,
        hairColor,
        distinguishingMarks,
        currentLocation-> {
            name
        },
        homeLocation-> {
            name
        },
        seasons[]-> {
            seasonNumber,
            title
        }
    }`

    // Pass seasonId as a parameter to the query
    const characters = await client.fetch(query, { seasonId })
    return characters
}

export default async function SeasonCharactersPage({
                                                       params
                                                   }: {
    params: Promise<{ seasonId: string }>
}) {
    const { seasonId } = await params
    const seasonNumber = parseInt(seasonId)
    // Now this works because getCharacters accepts a parameter
    const characters = await getCharacters(seasonNumber)

    return (
        <main className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto">
                <BackNavigation customBackPath={`/season/${seasonNumber}`} customBackLabel="Season" />
                <h1 className="text-4xl font-serif text-amber-400 text-center mb-2">
                    Characters of Season {seasonNumber}
                </h1>
                <p className="text-center text-amber-600 mb-8">
                    The heroes and villains of this chapter
                </p>

                {characters.length === 0 ? (
                    <p className="text-center text-gray-500">No characters found for this season.</p>
                ) : (
                    // In your component:
                    <Suspense fallback={<LoadingSkeleton />}>
                        <CharactersClient characters={characters} />
                    </Suspense>
                )}
            </div>
        </main>
    )

}
