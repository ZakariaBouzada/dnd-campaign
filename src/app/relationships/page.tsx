import { client } from '@/lib/sanity'
import RelationshipGraphWrapper from '@/components/RelationshipGraphWrapper'
import BackNavigation from '@/components/BackNavigation'
import { getAllCharacters } from '@/lib/sanityQueries'
import CharactersClient from '@/components/CharactersClient'

// 1. Updated Interface to match exactly with Graph and Wrapper
interface Character {
    _id: string
    name: string
    type: string
    role?: string
    imageUrl?: string
    currentLocation?: { _ref: string }
    relationships?: Array<{
        // Match the specific literal types here
        relationType: 'parent' | 'child' | 'sibling' | 'spouse' | 'ally' | 'rival' | 'mentor';
        target: {
            _id: string;
            name: string;
        };
    }>
}

interface PageProps {
    searchParams: Promise<{ character?: string }>
}

export default async function RelationshipsPage({ searchParams }: PageProps) {
    const { character: highlightCharacter } = await searchParams
    const characters = await getAllCharacters() as Character[]
    const highlightName = highlightCharacter ? decodeURIComponent(highlightCharacter) : undefined;
    const highlightedExists = characters.some((c: any) => c.name === highlightName);

    const getRelationCount = (type: string) => {
        return characters.filter(c =>
            c.relationships?.some((r: any) => r.relationType === type)
        ).length;
    }

    return (
        <main className="min-h-screen bg-[#050505] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <BackNavigation />

                <div className="text-center mb-12">
                    <div className="text-amber-600 text-[10px] tracking-[0.5em] uppercase mb-2">Social Fabric of the Realm</div>
                    <h1 className="text-5xl md:text-6xl font-serif text-amber-400 mb-4 drop-shadow-2xl">
                        The Great Web
                    </h1>
                    <p className="text-gray-500 italic text-sm max-w-xl mx-auto">
                        An intricate chronicle of blood ties, political alliances, and blood-sworn rivalries.
                    </p>
                    <div className="w-48 h-px bg-gradient-to-r from-transparent via-amber-800/60 to-transparent mx-auto mt-6" />

                    {highlightCharacter && (
                        <div className="mt-6 inline-flex items-center gap-2 bg-amber-950/40 border border-amber-600/30 rounded-full px-5 py-1.5 shadow-xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-xs font-serif italic text-amber-200 uppercase tracking-widest">
                                Tracing: {decodeURIComponent(highlightCharacter)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <RelationshipGraphWrapper
                        characters={characters}
                        highlightCharacter={highlightedExists ? highlightName : undefined}                     />

                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-amber-900/40 px-3 py-2 rounded text-[10px] text-amber-700 uppercase tracking-tighter pointer-events-none">
                        Scroll to Zoom • Drag to Pan
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard value={characters.length} label="Recorded Souls" />
                    <StatCard value={characters.filter((c: any) => c.type === 'PC').length} label="The Vanguard" />
                    <StatCard value={getRelationCount('ally')} label="Allied Bonds" />
                    <StatCard value={getRelationCount('rival')} label="Active Feuds" />
                </div>

                <footer className="mt-16 text-center opacity-40">
                    <div className="text-[10px] text-amber-800 tracking-[0.3em] uppercase">
                        Updated via the Royal Chronicler
                    </div>
                </footer>
            </div>
        </main>
    )
}

function StatCard({ value, label }: { value: number | string, label: string }) {
    return (
        <div className="bg-[#0a0a0a] border border-amber-900/20 rounded-lg p-5 text-center group hover:border-amber-600/40 transition-all duration-500 shadow-lg">
            <div className="text-3xl font-serif text-amber-500 mb-1 group-hover:scale-110 transition-transform">
                {value}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                {label}
            </div>
        </div>
    )
}