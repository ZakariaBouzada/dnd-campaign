export default async function AboutPage() {
    return (
        <main className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-serif text-amber-400 text-center mb-2">About the Campaign</h1>
                <p className="text-center text-amber-600 mb-8">The world &amp; its adventurers</p>

                {/* Setting */}
                <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-serif text-amber-400 mb-3">⚔️ The Setting</h2>
                    <p className="text-gray-400 leading-relaxed">
                        The Iron Chronicle takes place in the fractured kingdom of Valdris — once a unified empire,
                        now a patchwork of city-states, warring factions, and forgotten ruins. The northern Blackthorn
                        Legion has begun its march south, threatening to unite the shattered lands under an iron fist.
                    </p>
                </div>

                {/* The Party */}
                <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-serif text-amber-400 mb-3">👥 The Party</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-amber-800/30">
                                <th className="text-left text-xs text-amber-500 py-2">Character</th>
                                <th className="text-left text-xs text-amber-500 py-2">Player</th>
                                <th className="text-left text-xs text-amber-500 py-2">Class</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="border-b border-amber-800/20">
                                <td className="py-2 text-gray-300">Garret Ironfist</td>
                                <td className="py-2 text-gray-400">Marcus</td>
                                <td className="py-2 text-gray-400">Dwarf Fighter</td>
                            </tr>
                            <tr className="border-b border-amber-800/20">
                                <td className="py-2 text-gray-300">Elara Moonshadow</td>
                                <td className="py-2 text-gray-400">Sophie</td>
                                <td className="py-2 text-gray-400">Elven Sorceress</td>
                            </tr>
                            <tr className="border-b border-amber-800/20">
                                <td className="py-2 text-gray-300">Vale Shadowstep</td>
                                <td className="py-2 text-gray-400">Jack</td>
                                <td className="py-2 text-gray-400">Human Rogue</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Campaign Rules */}
                <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-amber-800/30 rounded-lg p-6">
                    <h2 className="text-xl font-serif text-amber-400 mb-3">📖 Campaign Rules</h2>
                    <p className="text-gray-400 leading-relaxed">
                        We play using D&D 5th Edition rules with some homebrew modifications.
                        Sessions are held every other week. The GM publishes story summaries and
                        new content within a few days of each session.
                    </p>
                </div>
            </div>
        </main>
    )
}