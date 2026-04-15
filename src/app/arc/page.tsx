import { getArc, getAllCharacters, getAllSessions } from '@/lib/sanityQueries'
import { urlFor } from '@/lib/sanity'
import Link from 'next/link'
import CK3MapClient from '@/components/CK3MapClient'
import { notFound } from "next/navigation"
import {getCampaignStats} from "@/lib/sanityQueries";

export default async function ChronicleArcPage() {


    // 1. Fetch the master Arc data and other global lists
    const arc = await getArc()
    const stat = await getCampaignStats()

    const characters = await getAllCharacters()
    const sessions = await getAllSessions()

    if (!arc) {
        console.log("❌ No active Arc found in Sanity")
        return notFound()
    }


    // 2. Extract the data already processed by your query
    const mapLocations = arc.locations || []
    const mapFactions = arc.factions || []
    const mapData = arc.processedMap

    // 3. Generate optimized map URL using the pixelCrop from getArc
    let optimizedMapUrl = '/images/maps/generic-map.jpeg'
    if (mapData?.imageAsset) {
        console.log("🖼️ Generating optimized map URL...")
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            let builder = urlFor(mapData.imageAsset)
                .width(2000)
                .auto('format')
                .quality(90)

            // Apply the pre-calculated pixel crop if it exists
            if (mapData.pixelCrop) {
                const pc = mapData.pixelCrop
                console.log("✂️ Applying pixel crop:", pc)
                builder = builder.rect(pc.x, pc.y, pc.width, pc.height)
            }

            optimizedMapUrl = builder.url()
            console.log("✅ Map URL generated")
        } catch (err) {
            console.error("❌ Map Builder Error:", err)
        }
    } else {
        console.log("⚠️ No map asset found, using fallback")
    }

    // 4. Calculate stats using the specific Arc data
    const stats = {
        totalSessions: sessions.length,
        totalLocations: mapLocations.length,
        totalFactions: mapFactions.length,
        totalCharacters: characters.length,
        // Use the fetched stat here instead of calculating from sessions
        totalSeasons: stat.totalSeasons
    }

    console.log("📊 Stats calculated:", stats)
    console.log("Total Featured in Sanity:", arc.featuredCharacters?.length);
    console.log("Featured Names:", arc.featuredCharacters?.map(c => c.name));

    return (
        <main className="min-h-screen bg-black">
            {/* Hero Banner */}
            <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                {arc.coverImageUrl ? (
                    <img
                        src={arc.coverImageUrl}
                        alt={arc.name}
                        className="absolute inset-0 w-full h-full object-cover brightness-50"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-950/40 via-black to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="text-amber-500 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4">The Complete Saga</div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-amber-400 mb-6 drop-shadow-2xl">
                        {arc.name}
                    </h1>
                    <p className="text-amber-600/80 text-base md:text-lg max-w-2xl italic px-4">
                        {arc.description || 'The epic chronicle of Westfold.'}
                    </p>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-amber-800/30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="text-amber-600 hover:text-amber-400 text-sm flex items-center gap-2">
                        <span>←</span> Back to Home
                    </Link>
                    <div className="flex gap-4 text-xs text-gray-500">
                        <span>{stats.totalCharacters} Heroes</span>
                        <span>•</span>
                        <span>{stats.totalFactions} Factions</span>
                        <span>•</span>
                        <span>{stats.totalSessions} Sessions</span>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="border-y border-amber-800/20 bg-amber-950/5 py-6">
                <div className="max-w-6xl mx-auto px-4 flex justify-center gap-6 md:gap-12 text-center flex-wrap">
                    <div><div className="text-2xl md:text-3xl font-serif text-amber-400">{stats.totalSeasons}</div><div className="text-[10px] md:text-xs text-gray-500 uppercase">Seasons</div></div>
                    <div className="w-px h-8 bg-amber-800/30" />
                    <div><div className="text-2xl md:text-3xl font-serif text-amber-400">{stats.totalCharacters}</div><div className="text-[10px] md:text-xs text-gray-500 uppercase">Heroes</div></div>
                    <div className="w-px h-8 bg-amber-800/30" />
                    <div><div className="text-2xl md:text-3xl font-serif text-amber-400">{stats.totalFactions}</div><div className="text-[10px] md:text-xs text-gray-500 uppercase">Factions</div></div>
                    <div className="w-px h-8 bg-amber-800/30" />
                    <div><div className="text-2xl md:text-3xl font-serif text-amber-400">{stats.totalLocations}</div><div className="text-[10px] md:text-xs text-gray-500 uppercase">Locations</div></div>
                    <div className="w-px h-8 bg-amber-800/30" />
                    <div><div className="text-2xl md:text-3xl font-serif text-amber-400">{stats.totalSessions}</div><div className="text-[10px] md:text-xs text-gray-500 uppercase">Sessions</div></div>
                </div>
            </div>

            {/* Master Map Section */}
            <section className="py-16 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-serif text-amber-400">The Complete Realm</h2>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-3" />
                    <p className="text-gray-500 text-xs md:text-sm mt-3">All territories, locations, and factions from every season</p>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-amber-800/40 shadow-[0_0_50px_rgba(0,0,0,0.5)] h-[60vh] md:h-[75vh] bg-[#050505]">
                    <CK3MapClient
                        mapImage={optimizedMapUrl}
                        locations={mapLocations}
                        factions={mapFactions}
                    />
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
                </div>
            </section>

            {/* Featured Heroes (The Vanguard) */}
            {arc.featuredCharacters && arc.featuredCharacters.length > 0 && (
                <section className="py-16 bg-amber-950/5 border-y border-amber-800/20">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex flex-col">
                                <h2 className="text-2xl md:text-3xl font-serif text-amber-400">Legendary Heroes</h2>
                                <div className="w-24 h-px bg-amber-600/50 mt-2" />
                            </div>

                            {/* Link to the full roster page */}
                            <Link
                                href="/arc/characters" // Added /arc/ to match your folder structure
                                className="text-xs text-amber-700 hover:text-amber-400 transition-colors uppercase tracking-[0.2em] font-bold border-b border-transparent hover:border-amber-400 pb-1"
                            >
                                View Full Roster →
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {/* Showing only a slice of the heroes to keep the UI tight */}
                            {arc.featuredCharacters.slice(0, 6).map((char: any) => (
                                <div key={char._id} className="group text-center">
                                    <div className="relative aspect-square rounded-full overflow-hidden border border-amber-800/30 bg-gradient-to-br from-amber-900/20 to-black group-hover:border-amber-500 transition-all duration-500">
                                        {char.imageUrl ? (
                                            <img
                                                src={char.imageUrl}
                                                alt={char.name}
                                                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">⚔️</div>
                                        )}
                                        {/* Inner vignette for that CK3 portrait look */}
                                        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] pointer-events-none" />
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-amber-400 font-serif text-sm tracking-wide">{char.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                                            {char.role || char.class || 'Vanguard'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Timeline of All Sessions */}
            <section className="py-16 px-4 max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-serif text-amber-400 text-center mb-10">The Complete Chronicle</h2>
                <div className="relative pl-8 border-l border-amber-800/30 space-y-8">
                    {sessions.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No sessions recorded yet.</p>
                    ) : (
                        sessions.map((session: any) => (
                            <div key={session._id} className="relative group">
                                <div className="absolute -left-[37px] top-1 w-5 h-5 rounded-full bg-black border border-amber-600 flex items-center justify-center text-[10px] text-amber-500">
                                    {session.sessionNumber}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-xs text-amber-600/80">Season {session.season?.seasonNumber}</span>
                                    <span className="text-xs text-gray-600">{session.date ? new Date(session.date).toLocaleDateString() : 'Date unknown'}</span>
                                </div>
                                <h3 className="text-lg md:text-xl font-serif text-amber-400 group-hover:text-amber-300">{session.title}</h3>
                                <p className="text-gray-400 text-sm italic">"{session.summary}"</p>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <footer className="py-12 border-t border-amber-800/20 text-center">
                <p className="text-gray-600 text-xs tracking-wider">⚔️ THE COMPLETE CHRONICLE — ALL SEASONS COMBINED ⚔️</p>
            </footer>
        </main>
    )
}