import { client } from '@/lib/sanity'

// Define the Chapter type
interface Chapter {
    title: string
    content: string
    order?: number
}

// Define the Season type
interface Season {
    seasonNumber: number
    title: string
    description?: string
    chapters?: Chapter[]
}

async function getSeason(seasonId: number): Promise<Season | null> {
    const query = `*[_type == "season" && seasonNumber == $seasonId][0] {
        seasonNumber,
        title,
        description,
        chapters[] { title, content, order }
    }`
    return await client.fetch(query, { seasonId })
}

export default async function SeasonHomePage({
                                                 params
                                             }: {
    params: Promise<{ seasonId: string }>  // ← params is a Promise
}) {
    const { seasonId } = await params  // ← AWAIT the params
    const season = await getSeason(parseInt(seasonId))

    if (!season) {
        return <div className="text-center text-gray-500 py-20">Season not found</div>
    }

    return (
        <main className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif text-amber-400 mb-2">
                        Season {season.seasonNumber}: {season.title}
                    </h1>
                    <p className="text-gray-400">{season.description}</p>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <a href={`/season/${seasonId}/characters`}
                       className="text-center p-4 border border-amber-800/30 rounded-lg hover:border-amber-500 transition bg-gray-900/50">
                        <div className="text-2xl mb-1">⚔️</div>
                        <div className="text-sm text-amber-400">Characters</div>
                    </a>
                    <a href={`/season/${seasonId}/map`}
                       className="text-center p-4 border border-amber-800/30 rounded-lg hover:border-amber-500 transition bg-gray-900/50">
                        <div className="text-2xl mb-1">🗺️</div>
                        <div className="text-sm text-amber-400">Map</div>
                    </a>
                    <a href={`/season/${seasonId}/timeline`}
                       className="text-center p-4 border border-amber-800/30 rounded-lg hover:border-amber-500 transition bg-gray-900/50">
                        <div className="text-2xl mb-1">📜</div>
                        <div className="text-sm text-amber-400">Timeline</div>
                    </a>
                    <a href={`/season/${seasonId}/factions`}
                       className="text-center p-4 border border-amber-800/30 rounded-lg hover:border-amber-500 transition bg-gray-900/50">
                        <div className="text-2xl mb-1">🏛️</div>
                        <div className="text-sm text-amber-400">Factions</div>
                    </a>
                </div>

                {/* Story Chapters */}
                {season.chapters && season.chapters.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-serif text-amber-400 mb-6 border-b border-amber-800/30 pb-2">The Story</h2>
                        <div className="space-y-8">
                            {season.chapters.map((chapter: Chapter, idx: number) => (
                                <div key={idx} className="border-l-2 border-amber-800/50 pl-6">
                                    <h3 className="text-xl font-serif text-amber-500 mb-2">{chapter.title}</h3>
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{chapter.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}