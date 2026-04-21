import { client } from '@/lib/sanity'
import Link from "next/link";
import {getArc, Arc} from '@/lib/sanityQueries'
import { urlFor } from '@/lib/sanity'
import CK3MapClient from "@/components/CK3MapClient";

async function getLatestSession() {
    const query = `*[_type == "session"] | order(date desc)[0] {
        sessionNumber,
        title,
        summary,
        date,
        "seasonNumber": season->seasonNumber // Add this line
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

async function getArcPreview() {
    const arc: Arc | null = await getArc();

    // Guard clause: if no arc is found, exit early
    if (!arc) return null;

    // 1. Process Map URL with the same logic as the Arc Page
    let optimizedMapUrl = '/images/maps/generic-map.jpeg'
    const mapData = arc.processedMap

    if (mapData?.imageAsset) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            let builder = urlFor(mapData.imageAsset)
                .width(2000)
                .auto('format')
                .quality(90)

            // Apply the pixel crop if it exists for consistency
            if (mapData.pixelCrop) {
                const pc = mapData.pixelCrop
                builder = builder.rect(pc.x, pc.y, pc.width, pc.height)
            }
            optimizedMapUrl = builder.url()
        } catch (err) {
            console.error("Home Map Preview Error:", err)
        }
    }

    return {
        arc,
        optimizedMapUrl,
        locations: arc.locations || [],
        factions: arc.factions || []
    };
}

export default async function HomePage() {
    const latestSession = await getLatestSession()
    const seasons = await getSeasons()
    const arcPreview = await getArcPreview()

    return (
        <main className="min-h-screen bg-black overflow-x-hidden">

            {/* ═══════════════════════════════════════════
                HERO — full-bleed cinematic title section
            ═══════════════════════════════════════════ */}
            <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden py-20">

                {/* Layered atmospheric background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(180,83,9,0.25),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_50%_100%,rgba(120,53,15,0.15),transparent)]" />

                {/* Decorative rune grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(0deg,#b45309 0,#b45309 1px,transparent 1px,transparent 60px),
                                          repeating-linear-gradient(90deg,#b45309 0,#b45309 1px,transparent 1px,transparent 60px)`,
                    }}
                />

                {/* Top ornamental divider */}
                <div className="relative mb-10 flex items-center gap-4 w-full max-w-xl">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-700/60" />
                    <span className="text-amber-600/70 text-lg">✦</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-700/60" />
                </div>

                {/* Eyebrow label */}
                <p className="text-amber-600/80 text-xs tracking-[0.4em] uppercase mb-6 font-light">
                    A Dungeons &amp; Dragons Campaign
                </p>

                {/* Main title */}
                <h1 className="relative text-6xl md:text-8xl lg:text-9xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-400 to-amber-700 tracking-wide leading-none mb-2 drop-shadow-[0_0_60px_rgba(251,191,36,0.15)]">
                    The Iron
                </h1>
                <h1 className="relative text-6xl md:text-8xl lg:text-9xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-400 via-amber-500 to-amber-800 tracking-wide leading-none mb-8 drop-shadow-[0_0_60px_rgba(251,191,36,0.15)]">
                    Chronicle
                </h1>

                {/* Subtitle */}
                <p className="text-amber-600/90 text-base md:text-lg tracking-widest max-w-2xl font-light italic mb-12">
                    A campaign of conquest, betrayal &amp; glory<br className="hidden md:block" /> in the fractured kingdom of Westerex
                </p>

                {/* Bottom ornamental divider */}
                <div className="relative flex items-center gap-4 w-full max-w-xl mb-12">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-700/60" />
                    <span className="text-amber-600/70 text-lg">⚔️</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-700/60" />
                </div>

                {/* ═══════════════════════════════════════════
    ARC PREVIEW CARD (Interactive Map Edition)
═══════════════════════════════════════════ */}
                {arcPreview && (
                    <div className="w-full max-w-5xl mx-auto px-4 mb-8 relative z-10 group">
                        <Link
                            href="/arc"
                            className="relative block overflow-hidden rounded-xl border border-amber-800/30 bg-zinc-950 transition-all duration-700 hover:-translate-y-2 hover:border-amber-500/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,119,6,0.15)]"
                        >
                            <div className="relative h-[500px] md:h-[600px] overflow-hidden">

                                {/* 1. THE INTERACTIVE MAP (Preview Mode) */}
                                <div className="absolute inset-0 transition-transform duration-[3000ms] group-hover:scale-110">
                                    <CK3MapClient
                                        mapImage={arcPreview.optimizedMapUrl}
                                        locations={arcPreview.locations}
                                        factions={arcPreview.factions}
                                        preview={true} // Assuming your component hides UI when preview is true
                                    />
                                </div>

                                {/* 2. CINEMATIC OVERLAYS (The "CK3 Look") */}
                                {/* Ultimate Vignette */}
                                <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,1)]" />

                                {/* Gradient Fade for text readability */}
                                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                                {/* Scanline Texture (Matches Season Preview) */}
                                <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,4px_100%]" />

                                {/* Decorative Corners */}
                                <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-amber-600/40 rounded-tl-lg z-30" />
                                <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-amber-600/40 rounded-tr-lg z-30" />
                                <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-amber-600/40 rounded-bl-lg z-30" />
                                <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-amber-600/40 rounded-br-lg z-30" />

                                {/* 3. CONTENT OVERLAY */}
                                <div className="absolute bottom-10 left-10 right-10 z-30 pointer-events-none">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[10px] text-amber-500 tracking-[0.4em] uppercase font-bold">The Complete Saga</span>
                                        <div className="h-px flex-1 bg-amber-900/30" />
                                        <span className="text-amber-700 text-xs">⚔️</span>
                                    </div>

                                    <h3 className="text-4xl md:text-5xl font-serif text-amber-400 group-hover:text-amber-300 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
                                        {arcPreview.arc.name}
                                    </h3>

                                    <p className="text-gray-300 text-sm md:text-base mt-4 max-w-2xl leading-relaxed italic line-clamp-2 drop-shadow-md">
                                        {arcPreview.arc.description}
                                    </p>

                                    <div className="flex items-center gap-3 mt-8 text-[11px] text-amber-600 font-bold tracking-[0.2em] uppercase">
                                        <span>Enter the Complete Chronicle</span>
                                        <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                                    </div>
                                </div>

                                {/* Bottom Interactive Glow Line */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center z-40" />
                            </div>
                        </Link>
                    </div>
                )}

            </div>


            {/* ═══════════════════════════════════════════
    LATEST SESSION
═══════════════════════════════════════════ */}
            {latestSession && (
                <section id="latest" className="relative max-w-4xl mx-auto px-4 py-20">
                    {/* Section label */}
                    <div className="flex items-center gap-4 mb-10">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-800/40" />
                        <span className="text-amber-500 text-xs tracking-[0.4em] uppercase">Chronicle Entry</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-800/40" />
                    </div>

                    {/* Use latestSession.seasonNumber for the link */}
                    <Link
                        href={`/season/${latestSession.seasonNumber}/timeline`}
                        className="block relative group"
                    >
                        {/* Glow behind card */}
                        <div className="absolute -inset-1 bg-gradient-to-b from-amber-900/20 to-transparent rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

                        <div className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-8 md:p-10 hover:border-amber-700/50 transition-all duration-500">
                            {/* Corner ornaments */}
                            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-amber-700/50" />
                            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-amber-700/50" />
                            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-amber-700/50" />
                            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-amber-700/50" />

                            <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xs text-amber-500 tracking-[0.3em] uppercase bg-amber-900/20 border border-amber-800/30 px-3 py-1 rounded-sm">
                        Latest Session
                    </span>
                                {latestSession.date && (
                                    <span className="text-xs text-amber-800">
                            {new Date(latestSession.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                                )}
                            </div>

                            <h2 className="text-2xl md:text-3xl font-serif text-amber-400 mb-4 leading-snug group-hover:text-amber-300 transition-colors">
                                Session {latestSession.sessionNumber}: {latestSession.title}
                            </h2>

                            <p className="text-gray-400 leading-relaxed text-base md:text-lg">{latestSession.summary}</p>

                            {/* Added visual "View" hint in the footer area */}
                            <div className="mt-6 pt-6 border-t border-amber-900/30 flex justify-between items-center">
                    <span className="text-[10px] text-amber-600 uppercase tracking-[0.2em] font-bold opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">
                        View Full Timeline →
                    </span>
                                <span className="text-xs text-amber-700 tracking-widest italic">— The Chronicler</span>
                            </div>
                        </div>
                    </Link>
                </section>
            )}

            {/* ═══════════════════════════════════════════
                SEASONS GRID
            ═══════════════════════════════════════════ */}
            <section className="relative max-w-6xl mx-auto px-4 py-20">
                <div className="flex items-center gap-4 mb-12">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-800/40" />
                    <h2 className="text-2xl md:text-3xl font-serif text-amber-400 tracking-wide">Seasons of the Chronicle</h2>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-800/40" />
                </div>

                {seasons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {seasons.map((season: any, index: number) => (
                            <a
                                key={season.seasonNumber}
                                href={`/season/${season.seasonNumber}`}
                                className="relative block group"
                            >
                                {/* Hover glow */}
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-amber-800/0 to-amber-900/0 group-hover:from-amber-800/20 group-hover:to-transparent rounded-lg blur transition-all duration-500" />

                                <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-6 group-hover:border-amber-600/50 transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col overflow-hidden">
                                    {/* Corner ornaments */}
                                    <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-amber-700/40 group-hover:border-amber-500/60 transition-colors" />
                                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-amber-700/40 group-hover:border-amber-500/60 transition-colors" />

                                    {/* Season number badge */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full border border-amber-800/50 flex items-center justify-center text-amber-600 text-xs font-mono group-hover:border-amber-600 group-hover:text-amber-400 transition-colors">
                                            {season.seasonNumber}
                                        </div>
                                        <span className="text-xs text-amber-700 tracking-widest uppercase">Season {season.seasonNumber}</span>
                                    </div>

                                    <h3 className="text-xl font-serif text-amber-400 mb-3 group-hover:text-amber-300 transition-colors leading-snug flex-1">
                                        {season.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{season.description}</p>

                                    <div className="flex items-center gap-2 text-amber-700 group-hover:text-amber-500 transition-colors text-xs tracking-widest uppercase mt-auto">
                                        <span>Enter the season</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600 italic">The seasons are not yet written…</p>
                )}
            </section>

            {/* ═══════════════════════════════════════════
                ABOUT THE CAMPAIGN (merged from AboutPage)
            ═══════════════════════════════════════════ */}
            <section id="about" className="relative max-w-4xl mx-auto px-4 py-20">
                {/* Atmospheric separator */}
                <div className="flex items-center gap-4 mb-16">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-800/40" />
                    <div className="text-center">
                        <div className="text-amber-600/40 text-2xl mb-2">⚔</div>
                        <h2 className="text-2xl md:text-3xl font-serif text-amber-400 tracking-wide">About the Campaign</h2>
                        <p className="text-amber-700 text-xs tracking-widest mt-1">The world &amp; its adventurers</p>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-800/40" />
                </div>

                <div className="space-y-6">
                    {/* The Setting */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-amber-900/0 group-hover:from-amber-900/10 to-transparent rounded-lg blur transition-all duration-500" />
                        <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-7 group-hover:border-amber-700/40 transition-all">
                            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-amber-800/40 group-hover:border-amber-600/50 transition-colors" />
                            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-amber-800/40 group-hover:border-amber-600/50 transition-colors" />

                            <h3 className="text-lg font-serif text-amber-400 mb-4 flex items-center gap-3">
                                <span className="text-xl">⚔️</span>
                                <span>The Setting</span>
                                <div className="flex-1 h-px bg-amber-900/40 ml-2" />
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                The Iron Chronicle takes place in the fractured kingdom of <span className="text-amber-500/80 italic">Westfold</span> — once a unified empire,
                                now a patchwork of city-states, warring factions, and forgotten ruins. The northern Blackthorn
                                Legion has begun its march south, threatening to unite the shattered lands under an iron fist.
                            </p>
                        </div>
                    </div>

                    {/* The Party */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-amber-900/0 group-hover:from-amber-900/10 to-transparent rounded-lg blur transition-all duration-500" />
                        <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-7 group-hover:border-amber-700/40 transition-all">
                            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-amber-800/40 group-hover:border-amber-600/50 transition-colors" />
                            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-amber-800/40 group-hover:border-amber-600/50 transition-colors" />

                            <h3 className="text-lg font-serif text-amber-400 mb-5 flex items-center gap-3">
                                <span className="text-xl">👥</span>
                                <span>The Party</span>
                                <div className="flex-1 h-px bg-amber-900/40 ml-2" />
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-amber-800/30">
                                        <th className="text-left text-xs text-amber-600 tracking-widest uppercase py-2 pr-4">Character</th>
                                        <th className="text-left text-xs text-amber-600 tracking-widest uppercase py-2 pr-4">Player</th>
                                        <th className="text-left text-xs text-amber-600 tracking-widest uppercase py-2">Class</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {[
                                        { char: 'Garret Ironfist', player: '-', cls: 'Dwarf Fighter', icon: '🪖' },
                                        { char: 'Elara Moonshadow', player: '-', cls: 'Elven Sorceress', icon: '🌙' },
                                        { char: 'Vale Shadowstep', player: '-', cls: 'Human Rogue', icon: '🗡️' },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-amber-900/20 group/row hover:bg-amber-900/5 transition-colors">
                                            <td className="py-3 pr-4">
                                                <span className="mr-2">{row.icon}</span>
                                                <span className="text-gray-200 font-medium">{row.char}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-amber-700">{row.player}</td>
                                            <td className="py-3 text-gray-400 text-sm italic">{row.cls}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Rules */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-amber-900/0 group-hover:from-amber-900/10 to-transparent rounded-lg blur transition-all duration-500" />
                        <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-7 group-hover:border-amber-700/40 transition-all">
                            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-amber-800/40 group-hover:border-amber-600/50 transition-colors" />
                            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-amber-800/40 group-hover:border-amber-600/50 transition-colors" />

                            <h3 className="text-lg font-serif text-amber-400 mb-4 flex items-center gap-3">
                                <span className="text-xl">📖</span>
                                <span>Campaign Rules</span>
                                <div className="flex-1 h-px bg-amber-900/40 ml-2" />
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                We play using <span className="text-amber-500/80">D&amp;D 5th Edition</span> rules with some homebrew modifications.
                                Sessions are held every other week. The GM publishes story summaries and
                                new content within a few days of each session.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════ */}
            <footer className="border-t border-amber-900/20 py-10 mt-10">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center gap-4 w-full max-w-sm">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-900/40" />
                        <span className="text-amber-800 text-sm">✦</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-900/40" />
                    </div>
                    <p className="text-amber-900 text-xs tracking-widest uppercase">The Iron Chronicle</p>
                    <p className="text-gray-700 text-xs italic">May your rolls be true and your stories legendary.</p>
                </div>
            </footer>
        </main>
    )
}