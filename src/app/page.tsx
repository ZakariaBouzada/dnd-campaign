import { client } from '@/lib/sanity'

// This function fetches characters from Sanity at build time
async function getCharacters() {
  const query = `*[_type == "character"] {
    name,
    role,
    type,
    race,
    class,
    hp,
    ac,
    traits,
    backstory,
    location-> {
      name
    },
    seasons[]-> {
      seasonNumber,
      title
    }
  }`

  const characters = await client.fetch(query)
  return characters
}

export default async function Home() {
  const characters = await getCharacters()

  return (
      <main className="min-h-screen bg-black p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-serif text-amber-400 text-center mb-2">The Grey Company</h1>
          <p className="text-center text-amber-600 mb-8">Characters from the campaign</p>

          {characters.length === 0 ? (
              <p className="text-center text-gray-500">No characters found. Add some in Sanity Studio!</p>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((char: any) => (
                    <div key={char.name} className="bg-gray-900 border border-amber-800 rounded-lg p-4 hover:border-amber-500 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-900 to-amber-950 flex items-center justify-center text-2xl">
                          {char.type === 'PC' ? '⚔️' : '👤'}
                        </div>
                        <div>
                          <h2 className="text-xl font-serif text-amber-400">{char.name}</h2>
                          <p className="text-sm text-amber-600">{char.role || 'No role'}</p>
                          <span className="text-xs px-2 py-0.5 bg-amber-900/30 text-amber-500 rounded">
                      {char.type}
                    </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-3 flex-wrap">
                        {char.race && <span className="text-xs text-gray-400">{char.race}</span>}
                        {char.class && <span className="text-xs text-gray-400">{char.class}</span>}
                        {char.hp && <span className="text-xs text-gray-400">HP: {char.hp}</span>}
                        {char.ac && <span className="text-xs text-gray-400">AC: {char.ac}</span>}
                      </div>

                      {char.traits && char.traits.length > 0 && (
                          <div className="flex gap-1 mb-3 flex-wrap">
                            {char.traits.map((trait: string) => (
                                <span key={trait} className="text-xs px-2 py-0.5 border border-amber-800 text-amber-500 rounded">
                        {trait}
                      </span>
                            ))}
                          </div>
                      )}

                      {char.location && (
                          <p className="text-xs text-gray-500 mt-2">📍 {char.location.name}</p>
                      )}
                    </div>
                ))}
              </div>
          )}
        </div>
      </main>
  )
}