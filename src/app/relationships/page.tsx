import { client } from '@/lib/sanity'
import RelationshipGraphWrapper from '@/components/RelationshipGraphWrapper'
import BackNavigation from '@/components/BackNavigation'

interface Character {
    _id: string
    name: string
    type: string
    role?: string
    family?: { name: string }[]
    allies?: { name: string }[]
    rivals?: { name: string }[]
}

async function getCharacters(): Promise<Character[]> {
    const query = `*[_type == "character"] {
        _id,
        name,
        type,
        role,
        family[]-> {
            name
        },
        allies[]-> {
            name
        },
        rivals[]-> {
            name
        }
    }`
    return await client.fetch(query)
}

interface PageProps {
    searchParams: Promise<{ character?: string }>
}

export default async function RelationshipsPage({ searchParams }: PageProps) {
    const { character: highlightCharacter } = await searchParams
    const characters = await getCharacters()

    return (
        <main className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto">
                <BackNavigation />
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif text-amber-400 mb-2">Character Relationships</h1>
                    <p className="text-amber-600 text-sm">The web of alliances, rivalries, and blood ties</p>
                    <div className="w-24 h-px bg-amber-700/50 mx-auto mt-4" />

                    {/* Show which character is highlighted */}
                    {highlightCharacter && (
                        <div className="mt-4 inline-block bg-amber-900/30 border border-amber-600/50 rounded-full px-4 py-1">
                            <span className="text-xs text-amber-400">
                                Highlighting: {decodeURIComponent(highlightCharacter)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Graph - Client Component handles all interactivity */}
                <RelationshipGraphWrapper
                    characters={characters}
                    highlightCharacter={highlightCharacter ? decodeURIComponent(highlightCharacter) : undefined}
                />

                {/* Legend and Instructions */}
                <div className="mt-6 text-center text-gray-500 text-xs">
                    <p>🖱️ Drag to pan • Scroll to zoom • Click on nodes to select</p>
                    <p className="mt-1">Lines represent relationships: <span className="text-amber-500">Family</span> • <span className="text-blue-400">Allies</span> • <span className="text-red-400">Rivals (dashed)</span></p>
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-gray-900/50 border border-amber-800/30 rounded-lg p-3">
                        <div className="text-2xl font-serif text-amber-400">{characters.length}</div>
                        <div className="text-xs text-gray-500">Total Characters</div>
                    </div>
                    <div className="bg-gray-900/50 border border-amber-800/30 rounded-lg p-3">
                        <div className="text-2xl font-serif text-amber-400">
                            {characters.filter((c: Character) => c.type === 'PC').length}
                        </div>
                        <div className="text-xs text-gray-500">Player Characters</div>
                    </div>
                    <div className="bg-gray-900/50 border border-amber-800/30 rounded-lg p-3">
                        <div className="text-2xl font-serif text-amber-400">
                            {characters.filter((c: Character) => c.allies && c.allies.length > 0).length}
                        </div>
                        <div className="text-xs text-gray-500">With Allies</div>
                    </div>
                    <div className="bg-gray-900/50 border border-amber-800/30 rounded-lg p-3">
                        <div className="text-2xl font-serif text-amber-400">
                            {characters.filter((c: Character) => c.rivals && c.rivals.length > 0).length}
                        </div>
                        <div className="text-xs text-gray-500">With Rivals</div>
                    </div>
                </div>
            </div>
        </main>
    )
}