'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'

interface SearchItem {
    type: 'character' | 'faction' | 'location'
    name: string
    id: string
    season?: number
}

export default function Search({ items }: { items: SearchItem[] }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchItem[]>([])

    // Use useMemo to create Fuse instance only when items change
    const fuse = useMemo(() => {
        return new Fuse(items, {
            keys: ['name'],
            threshold: 0.3,
        })
    }, [items])

    // Use useCallback to memoize the search function
    const performSearch = useCallback((searchQuery: string) => {
        if (searchQuery.length > 1) {
            const searchResults = fuse.search(searchQuery).map(r => r.item)
            return searchResults
        }
        return []
    }, [fuse])

    // Handle search when query changes - using a timeout to debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            const newResults = performSearch(query)
            setResults(newResults)
        }, 150) // Debounce delay

        return () => clearTimeout(timer)
    }, [query, performSearch])

    // Keyboard shortcut: Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                const searchInput = document.getElementById('search-input')
                if (searchInput) {
                    searchInput.focus()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div className="relative">
            <input
                id="search-input"
                type="text"
                placeholder="Search... (Ctrl+K)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-gray-900 border border-amber-800/30 rounded px-3 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-500 w-48 md:w-64"
            />
            {results.length > 0 && (
                <div className="absolute top-full mt-1 right-0 w-64 bg-gray-900 border border-amber-800/30 rounded shadow-lg z-50 max-h-64 overflow-y-auto">
                    {results.slice(0, 5).map((result, index) => (
                        <a
                            key={`${result.type}-${result.id}-${index}`}
                            href={`/${result.type}s/${result.id}`}
                            className="block px-3 py-2 hover:bg-amber-900/30 text-sm text-gray-300 border-b border-amber-800/20 last:border-0"
                            onClick={() => setQuery('')} // Clear search after click
                        >
                            <span className="text-amber-500 text-xs mr-2 uppercase">{result.type}</span>
                            {result.name}
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}