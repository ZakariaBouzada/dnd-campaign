import Link from 'next/link'
import CK3MapWrapper from '@/components/CK3MapWrapper'

export default async function SeasonMapPage({
                                                params
                                            }: {
    params: Promise<{ seasonId: string }>
}) {
    const { seasonId } = await params
    const seasonNumber = parseInt(seasonId)

    return (
        <main className="min-h-screen bg-black p-8">
            <div className="max-w-7xl mx-auto">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-amber-800/30">
                    <Link
                        href={`/season/${seasonId}`}
                        className="flex items-center gap-1 text-amber-600 hover:text-amber-400 transition text-sm group"
                    >
                        <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
                        <span>Back to Season</span>
                    </Link>
                    <Link href="/" className="text-xs text-gray-500 hover:text-amber-400 transition flex items-center gap-1">
                        <span>🏠</span> Home
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif text-amber-400 mb-2">
                        The Realm of Valdris
                    </h1>
                    <p className="text-amber-600 text-sm tracking-wider">
                        Season {seasonNumber} · A fractured kingdom on the brink of war
                    </p>
                    <div className="w-24 h-px bg-amber-700/50 mx-auto mt-4" />
                </div>

                {/* Map - fetches locations from Sanity */}
                <CK3MapWrapper seasonId={seasonNumber} />

                {/* Legend */}
                <div className="mt-6 flex justify-center gap-4 flex-wrap">
                    <div className="text-xs text-gray-500">📍 Click markers for location details</div>
                    <div className="text-xs text-gray-500">🖱️ Hover to see location names</div>
                </div>
            </div>
        </main>
    )
}