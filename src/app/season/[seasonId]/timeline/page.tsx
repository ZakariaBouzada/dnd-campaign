import { client } from '@/lib/sanity'

// Define types at the top
interface TimelineCharacter {
    name: string
}

interface TimelineSession {
    sessionNumber: number
    title: string
    summary: string
    date: string
    keyEvents: string[]
    charactersPresent: TimelineCharacter[]
}

async function getSessions(seasonId: number): Promise<TimelineSession[]> {
    const query = `*[_type == "session" && season->.seasonNumber == $seasonId] | order(sessionNumber asc) {
        sessionNumber,
        title,
        summary,
        date,
        keyEvents,
        charactersPresent[]-> {
            name
        }
    }`
    return await client.fetch(query, { seasonId })
}

export default async function SeasonTimelinePage({
                                                     params
                                                 }: {
    params: Promise<{ seasonId: string }>
}) {
    const { seasonId } = await params
    const seasonNumber = parseInt(seasonId)
    const sessions = await getSessions(seasonNumber)

    return (
        <main className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-serif text-amber-400 text-center mb-2">
                    Timeline of Season {seasonNumber}
                </h1>
                <p className="text-center text-amber-600 mb-8">The chronicle of sessions past</p>

                {sessions.length === 0 ? (
                    <p className="text-center text-gray-500">No sessions found for this season.</p>
                ) : (
                    <div className="relative">
                        {/* Timeline vertical line */}
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-amber-800/30"></div>

                        <div className="space-y-6">
                            {sessions.map((session: TimelineSession) => (
                                <div key={session.sessionNumber} className="relative pl-10">
                                    {/* Timeline dot */}
                                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-amber-900/50 border border-amber-500 flex items-center justify-center text-xs text-amber-400">
                                        {session.sessionNumber}
                                    </div>

                                    {/* Session card */}
                                    <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-5 hover:border-amber-600/50 transition-all">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="text-xs text-amber-500">{session.date}</span>
                                        </div>
                                        <h2 className="text-xl font-serif text-amber-400 mb-2">{session.title}</h2>
                                        <p className="text-gray-400 text-sm mb-3">{session.summary}</p>

                                        {/* Key Events */}
                                        {session.keyEvents && session.keyEvents.length > 0 && (
                                            <div className="mb-3">
                                                <h3 className="text-xs font-serif text-amber-500 tracking-wider mb-1">KEY EVENTS</h3>
                                                <ul className="space-y-1">
                                                    {session.keyEvents.map((event: string, idx: number) => (
                                                        <li key={idx} className="text-gray-500 text-sm flex items-start gap-2">
                                                            <span className="text-amber-600">⚔️</span>
                                                            {event}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Characters Present */}
                                        {session.charactersPresent && session.charactersPresent.length > 0 && (
                                            <div>
                                                <h3 className="text-xs font-serif text-amber-500 tracking-wider mb-1">CHARACTERS</h3>
                                                <div className="flex gap-2 flex-wrap">
                                                    {session.charactersPresent.map((character: TimelineCharacter) => (
                                                        <span key={character.name} className="text-xs px-2 py-1 bg-amber-900/30 text-amber-400 rounded">
                                                            {character.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}