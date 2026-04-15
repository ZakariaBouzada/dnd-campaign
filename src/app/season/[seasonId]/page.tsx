import { client } from '@/lib/sanity'
import BackNavigation from "@/components/BackNavigation";
import Link from 'next/link';
import { getActiveMapForSeason } from '@/lib/sanityQueries'
import { urlFor } from '@/lib/sanity'
import MapPreview from "@/components/MapPreview";
import CK3Map from "@/components/CK3Map";

// --- DATA FETCHING ---
async function getSeasonData(seasonId: number) {
    const query = `{
        "season": *[_type == "season" && seasonNumber == $seasonId][0] {
            seasonNumber,
            title,
            description,
            chapters[] { title, content, order }
        },
        "characters": *[_type == "character" && $seasonId in seasons[]->.seasonNumber] | order(name asc) {
            _id,
            name,
            class,
            "imageUrl": portrait.asset->url
        },
        // FIX APPLIED HERE: Filter factions by existence of territories for this season
        "factions": *[_type == "faction" && count(territories[season->.seasonNumber == $seasonId]) > 0] | order(name asc) {
            _id,
            name,
            symbol,
            color,
            tagline,
            "territoryData": territories[season->.seasonNumber == $seasonId][0].territoryData {
                type,
                polygonPoints[] { x, y },
                arrows[] { point { x, y }, direction, label }
            }
        },
        "locations": *[_type == "location" && defined(seasonCoordinates[season->.seasonNumber == $seasonId].coordinates)] {
            _id,
            name,
            "coordinates": seasonCoordinates[season->.seasonNumber == $seasonId][0].coordinates
        },
        "timeline": *[_type == "session" && season->seasonNumber == $seasonId] | order(sessionNumber desc)[0...3] {
            _id,
            sessionNumber,
            title,
            date,
            summary
        },
        // Updated factionCount to match the filtered list
        "factionCount": count(*[_type == "faction" && count(territories[season->.seasonNumber == $seasonId]) > 0]),
        "locationCount": count(*[_type == "location" && defined(seasonCoordinates[season->.seasonNumber == $seasonId][0].coordinates)])
    }`
    return await client.fetch(query, { seasonId })
}

export default async function SeasonHomePage({ params }: { params: Promise<{ seasonId: string }> }) {
    const { seasonId } = await params
    const seasonNumber = parseInt(seasonId)
// 1. Fetch your unified data
    const data = await getSeasonData(seasonNumber)

// 2. Fetch the map specifically using your EXISTING helper
    const activeMap = await getActiveMapForSeason(seasonNumber)

    const { season, characters, factions, timeline, locationCount } = data

    // 3. Replicate your existing Map Page logic for the URL
    let optimizedMapUrl = '/images/maps/generic-map.png'
    if (activeMap?.imageAsset) {
        const imageBuilder = urlFor(activeMap.imageAsset)
        if (imageBuilder) {
            let builder = imageBuilder
                .format('webp')
                .width(1600) // Lower width for faster loading as a preview
                .quality(90)

            if (activeMap.pixelCrop) {
                const pc = activeMap.pixelCrop
                builder = builder.rect(pc.x, pc.y, pc.width, pc.height)
            }
            optimizedMapUrl = builder.url()
        }
    }

    // --- DEBUG LOGS (Check your terminal) ---
    console.log("Map Found via Helper:", activeMap?.name)
    console.log("Optimized URL:", optimizedMapUrl)

    if (!season) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-amber-900 font-serif">
                <span className="text-6xl mb-4">📜</span>
                <p className="text-xl italic">The records for this era are lost to time...</p>
                <Link href="/" className="mt-8 text-amber-600 hover:text-amber-400 underline underline-offset-4 transition-all">Return to Chronology</Link>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-black text-gray-300 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" />

            <div className="max-w-6xl mx-auto px-6 py-12 relative">
                <BackNavigation customBackPath="/" customBackLabel="Back to Realm" useBrowserBack={false}/>

                {/* ═══════════════════════════════════════════
                    HEADER
                ═══════════════════════════════════════════ */}
                <header className="text-center mt-12 mb-20">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-800"/>
                        <span
                            className="text-amber-600 text-xs tracking-[0.4em] uppercase font-light">Season {season.seasonNumber}</span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-800"/>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 mb-6 drop-shadow-2xl italic pb-2">
                        {season.title}
                    </h1>
                    <p className="text-amber-600/80 italic font-serif text-lg max-w-2xl mx-auto leading-relaxed">
                        {season.description}
                    </p>
                </header>

                {/* ═══════════════════════════════════════════
    WORLD MAP PREVIEW (Cinematic "Pop-Out" Edition)
═══════════════════════════════════════════ */}
                <section className="mb-16 group">
                    <Link href={`/season/${seasonId}/map`}
                          className="relative block rounded-xl border border-amber-900/40 bg-zinc-950
                     transition-all duration-700 ease-out
                     /* Hover Effects: Lift up, brighten border, and add massive glow */
                     hover:-translate-y-2 hover:border-amber-500/50
                     hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,119,6,0.15)]
                     overflow-visible">

                        {/* The Frame Container - This handles the clipping and the aspect ratio */}
                        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl">

                            {/* 1. ULTIMATE VIGNETTE (All-around shadowing)
                This creates the 'sunken' look by darkening all four edges heavily. */}
                            <div className="absolute inset-0 z-20 pointer-events-none
                            shadow-[inset_0_0_100px_rgba(0,0,0,1),inset_0_0_40px_rgba(0,0,0,0.9)]" />

                            {/* 2. SCANLINE EFFECT
                Adds that 'tactical screen' texture that only appears clearly on hover. */}
                            <div className="absolute inset-0 z-20 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-700
                            bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]
                            bg-[length:100%_4px,4px_100%]" />

                            {/* 3. DYNAMIC AMBIENT LIGHTING
                A faint amber pulse that sits behind the map. */}
                            <div className="absolute inset-0 bg-amber-600/5 mix-blend-color z-10 pointer-events-none animate-pulse" />

                            {/* 4. THE MAP COMPONENT
                Adding a slight zoom effect on the container via the group-hover. */}
                            <div className="relative w-full h-full flex items-center justify-center transition-transform duration-[3000ms] group-hover:scale-105">
                                <CK3Map
                                    mapImage={optimizedMapUrl}
                                    locations={data.locations || []}
                                    factions={factions || []}
                                    preview={true}
                                />
                            </div>

                            {/* 5. BOTTOM TEXT PROTECTION
                Stronger gradient for text contrast. */}
                            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-20"/>

                            {/* 6. CORNER ORNAMENTS (Animated)
                These 'bracket' the corners and glow on hover. */}
                            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-amber-600/20 group-hover:border-amber-500/60 transition-colors duration-500 z-30" />
                            <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-amber-600/20 group-hover:border-amber-500/60 transition-colors duration-500 z-30" />
                            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-amber-600/20 group-hover:border-amber-500/60 transition-colors duration-500 z-30" />
                            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-amber-600/20 group-hover:border-amber-500/60 transition-colors duration-500 z-30" />
                        </div>

                        {/* Content Overlay (Outside the clipping container so it doesn't scale) */}
                        <div className="absolute bottom-8 left-10 z-30 pointer-events-none">
                            <div className="overflow-hidden">
                                <h2 className="text-4xl font-serif text-amber-200 mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]
                               translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">
                                    {activeMap?.name || "The Known World"}
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-px w-12 bg-gradient-to-r from-amber-600 to-transparent shadow-[0_0_8px_rgba(217,119,6,0.5)]"/>
                                <p className="text-amber-500/80 text-[11px] tracking-[0.5em] uppercase font-bold drop-shadow-md">
                                    Strategic Overview — {locationCount || 0} Registered Sites
                                </p>
                            </div>
                        </div>

                        {/* THE 'HINT' LABEL (Appears only on hover) */}
                        <div className="absolute top-8 right-10 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                            <span className="text-amber-400/60 text-[10px] tracking-widest uppercase italic bg-black/40 px-3 py-1 border border-amber-900/30 backdrop-blur-sm">
                                Enter Map Interface →
                            </span>
                        </div>
                    </Link>
                </section>

                {/* ═══════════════════════════════════════════
    FACTIONS & TIMELINE GRID
═══════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">

                    {/* FACTION PREVIEW */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-xl font-serif text-amber-400 tracking-wide whitespace-nowrap">
                                Active Powers
                            </h2>
                            <div className="flex-1 h-px bg-amber-900/40"/>
                        </div>

                        <div className="space-y-4">
                            {factions && factions.length > 0 ? factions.map((faction: any) => (
                                <Link
                                    key={faction._id}
                                    href={`/season/${seasonId}/factions`}
                                    className="relative block p-4 bg-zinc-900/30 border border-amber-900/20 rounded-lg hover:border-amber-500/50 hover:bg-zinc-900/60 transition-all group overflow-hidden"
                                >
                                    {/* Faction Color Accent - Gives that "map marker" feel */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1 opacity-70 group-hover:opacity-100 transition-opacity"
                                        style={{ backgroundColor: faction.color || '#d97706' }}
                                    />

                                    <div className="flex items-center gap-4">
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-500">
                            {faction.symbol || '⚜️'}
                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-amber-500 font-serif text-sm truncate">
                                                {faction.name}
                                            </h3>
                                            <p className="text-[10px] text-gray-500 italic truncate tracking-wide">
                                                {faction.tagline || 'No recorded motto'}
                                            </p>
                                        </div>
                                        {/* Subtle arrow that appears on hover */}
                                        <span className="text-amber-900 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                            →
                        </span>
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-8 border border-dashed border-amber-900/20 rounded-lg text-center">
                                    <p className="text-xs text-gray-600 italic uppercase tracking-widest">
                                        No factional records for this era.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RECENT TIMELINE */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-xl font-serif text-amber-400 tracking-wide whitespace-nowrap">Recent
                                Chronicles</h2>
                            <div className="flex-1 h-px bg-amber-900/40"/>
                            <Link href={`/season/${seasonId}/timeline`}
                                  className="text-[10px] text-amber-700 hover:text-amber-400 uppercase tracking-widest transition-colors">Full
                                Archive →</Link>
                        </div>
                        <div className="relative pl-8 border-l border-amber-900/30 space-y-8">
                            {timeline && timeline.length > 0 ? timeline.map((session: any) => (
                                <div key={session.sessionNumber} className="relative group">
                                    <div
                                        className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-black border border-amber-600 flex items-center justify-center text-[8px] text-amber-500 shadow-[0_0_10px_rgba(217,119,6,0.2)]">
                                        {session.sessionNumber}
                                    </div>
                                    <h3 className="text-amber-400 font-serif text-md group-hover:text-amber-200 transition-colors">{session.title}</h3>
                                    <p className="text-gray-500 text-[10px] mb-2 uppercase tracking-tighter">{session.date}</p>
                                    <p className="text-gray-400 text-sm line-clamp-2 italic font-light">"{session.summary}"</p>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-600 italic">No sessions have been chronicled yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    THE VANGUARD (Characters)
                ═══════════════════════════════════════════ */}
                <section className="mb-24">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-2xl font-serif text-amber-400 tracking-wide whitespace-nowrap">The
                            Vanguard</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-amber-900/40 to-transparent"/>
                        <Link href={`/season/${seasonId}/characters`}
                              className="text-xs text-amber-700 hover:text-amber-400 transition-colors uppercase tracking-[0.2em]">Full
                            Roster →</Link>
                    </div>

                    {characters && characters.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                            {characters.slice(0, 5).map((char: any) => (
                                <div key={char._id}
                                     className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-amber-900/20 bg-zinc-950 shadow-lg hover:border-amber-600/50 transition-all duration-500">
                                    {char.imageUrl ? (
                                        <img src={char.imageUrl} alt={char.name}
                                             className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"/>
                                    ) : (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center text-amber-900/10 text-4xl">⚔️</div>
                                    )}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"/>
                                    <div className="absolute bottom-0 left-0 p-4 w-full">
                                        <p className="text-amber-400 font-serif text-sm leading-tight">{char.name}</p>
                                        <p className="text-[9px] text-amber-800 uppercase tracking-widest font-bold mt-1">{char.class}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center border border-dashed border-amber-900/20 rounded-xl">
                            <p className="text-sm text-gray-600 italic font-serif">No adventurers have stepped forth in
                                this chapter.</p>
                        </div>
                    )}
                </section>

                {/* ═══════════════════════════════════════════
                    THE STORY CHRONICLE
                ═══════════════════════════════════════════ */}
                <section className="max-w-4xl mx-auto mb-24">
                    <div className="flex items-center gap-6 mb-16">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-900/50"/>
                        <h2 className="text-3xl font-serif text-amber-500 tracking-widest uppercase">The Story</h2>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-900/50"/>
                    </div>

                    {season.chapters && season.chapters.length > 0 ? (
                        <div className="space-y-32">
                            {season.chapters.map((chapter: any, idx: number) => (
                                <article key={idx} className="relative pl-12 border-l border-amber-900/30 group">
                                    <div
                                        className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border border-amber-700 bg-black flex items-center justify-center">
                                        <div
                                            className="w-1.5 h-1.5 bg-amber-500 rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_#f59e0b]"/>
                                    </div>
                                    <h3 className="text-4xl font-serif text-amber-400 mb-8 group-hover:text-amber-200 transition-colors drop-shadow-md">
                                        {chapter.title}
                                    </h3>
                                    <div
                                        className="text-gray-400 leading-relaxed text-lg font-light first-letter:text-7xl first-letter:font-serif first-letter:text-amber-600 first-letter:mr-4 first-letter:float-left first-letter:leading-[0.7] whitespace-pre-wrap">
                                        {chapter.content}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="text-center py-24 border border-dashed border-amber-900/20 rounded-2xl bg-zinc-900/10">
                            <p className="text-amber-900/60 italic font-serif">The scrolls for this era are currently
                                empty...</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Footer */}
            <footer className="py-16 border-t border-amber-900/20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-900/5 opacity-20"/>
                <span className="text-amber-800 text-xs italic font-serif relative z-10 tracking-[0.4em] uppercase">
                    May your path be guided by the light of Valdris
                </span>
            </footer>
        </main>
    )
}