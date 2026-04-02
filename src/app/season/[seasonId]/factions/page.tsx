import { client } from '@/lib/sanity'

interface FactionMember {
    name: string
    type: string
}

interface Faction {
    name: string
    symbol: string
    color: string
    tagline: string
    goals: string
    territory: string
    members: FactionMember[]
}

async function getFactions(seasonId: number): Promise<Faction[]> {
    // Get all factions - filter by season through members
    const query = `*[_type == "faction"] {
        name,
        symbol,
        color,
        tagline,
        goals,
        territory,
        members[]-> {
            name,
            type,
            "seasons": seasons[]->.seasonNumber
        }
    }`
    const allFactions = await client.fetch(query)

    // Filter factions that have at least one member active in this season
    const filteredFactions = allFactions.filter((faction: any) => {
        return faction.members?.some((member: any) =>
            member.seasons?.includes(seasonId)
        )
    })

    return filteredFactions
}

export default async function SeasonFactionsPage({
                                                     params
                                                 }: {
    params: Promise<{ seasonId: string }>
}) {
    const { seasonId } = await params
    const seasonNumber = parseInt(seasonId)
    const factions = await getFactions(seasonNumber)

    return (
        <main className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-serif text-amber-400 text-center mb-2">
                    Factions of Season {seasonNumber}
                </h1>
                <p className="text-center text-amber-600 mb-8">The powers that shape the realm</p>

                {factions.length === 0 ? (
                    <p className="text-center text-gray-500">No factions found for this season.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {factions.map((faction) => (
                            <div
                                key={faction.name}
                                className="bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-6 hover:border-amber-600/50 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-4xl">{faction.symbol || '⚜️'}</span>
                                    <div>
                                        <h2 className="text-2xl font-serif text-amber-400">{faction.name}</h2>
                                        {faction.tagline && (
                                            <p className="text-sm text-amber-600/80 italic">{`"${faction.tagline}"`}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Goals */}
                                {faction.goals && (
                                    <div className="mb-4">
                                        <h3 className="text-xs font-serif text-amber-500 tracking-wider mb-1">GOALS</h3>
                                        <p className="text-gray-400 text-sm">{faction.goals}</p>
                                    </div>
                                )}

                                {/* Members */}
                                {faction.members && faction.members.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="text-xs font-serif text-amber-500 tracking-wider mb-1">NOTABLE MEMBERS</h3>
                                        <div className="flex gap-2 flex-wrap">
                                            {faction.members.map((member) => (
                                                <span
                                                    key={member.name}
                                                    className="text-xs px-2 py-1 bg-amber-900/30 text-amber-400 rounded"
                                                >
                                                    {member.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Territory */}
                                {faction.territory && (
                                    <div>
                                        <h3 className="text-xs font-serif text-amber-500 tracking-wider mb-1">TERRITORY</h3>
                                        <p className="text-gray-500 text-sm">{faction.territory}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}