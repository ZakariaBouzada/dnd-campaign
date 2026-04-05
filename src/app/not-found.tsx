import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="min-h-screen bg-black flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="text-8xl mb-4">🗺️</div>
                <h1 className="text-4xl font-serif text-amber-400 mb-2">404</h1>
                <p className="text-gray-400 mb-6">This page has been lost to the ages...</p>
                <Link href="/" className="text-amber-600 hover:text-amber-400 border border-amber-800/50 px-4 py-2 rounded">
                    Return to Home
                </Link>
            </div>
        </main>
    )
}