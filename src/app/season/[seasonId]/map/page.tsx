export default async function SeasonMapPage({
                                                params
                                            }: {
    params: Promise<{ seasonId: string }>
}) {
    const { seasonId } = await params
    const seasonNumber = parseInt(seasonId)

    return (
        <main className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-4xl font-serif text-amber-400 mb-2">
                    Map of Season {seasonNumber}
                </h1>
                <p className="text-amber-600 mb-8">Interactive map coming soon</p>

                <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-12">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-gray-400">
                        The interactive map with Leaflet is currently under development.
                        <br />
                        Check back soon for territories, location markers, and season filtering!
                    </p>
                </div>
            </div>
        </main>
    )
}