import { client } from '@/lib/sanity'

async function getLatestSession() {
    const query = `*[_type == "session"] | order(date desc)[0] {
        sessionNumber,
        title,
        summary,
        date
    }`
    return await client.fetch(query)
}

async function getSeasons() {
    const query = `*[_type == "season"] | order(seasonNumber asc) {
        seasonNumber,
        title,
        description
    }`
    return await client.fetch(query)
}

export default async function HomePage() {
    const latestSession = await getLatestSession()
    const seasons = await getSeasons()

    return (
        <main className="min-h-screen bg-black">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-amber-950/20 to-transparent py-16 text-center border-b border-amber-800/30">
                <h1 className="text-5xl md:text-6xl font-serif text-amber-400 mb-4 tracking-wide">
                    The Iron Chronicle
                </h1>
                <p className="text-amber-600 text-sm tracking-wider max-w-2xl mx-auto px-4">
                    A campaign of conquest, betrayal & glory in the fractured kingdom of Valdris
                </p>
            </div>

            {/* Latest Session */}
            {latestSession && (
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-6">
                        <div className="text-xs text-amber-500 tracking-wider mb-2">LATEST SESSION</div>
                        <h2 className="text-2xl font-serif text-amber-400 mb-2">
                            Session {latestSession.sessionNumber}: {latestSession.title}
                        </h2>
                        <p className="text-gray-400 leading-relaxed">{latestSession.summary}</p>
                    </div>
                </div>
            )}

            {/* Seasons Grid */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-serif text-amber-400 text-center mb-8">Seasons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {seasons.map((season: any) => (
                        <a
                            key={season.seasonNumber}
                            href={`/season/${season.seasonNumber}`}
                            className="block bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-6 hover:border-amber-600/50 transition-all hover:translate-y-[-4px] group"
                        >
                            <div className="text-sm text-amber-600 mb-2">Season {season.seasonNumber}</div>
                            <h3 className="text-xl font-serif text-amber-400 mb-2 group-hover:text-amber-300">
                                {season.title}
                            </h3>
                            <p className="text-gray-400 text-sm">{season.description}</p>
                        </a>
                    ))}
                </div>
            </div>
        </main>
    )
}