'use client'

import { useState, useEffect } from 'react'

export default function BackToTop() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const toggle = () => setVisible(window.scrollY > 500)
        window.addEventListener('scroll', toggle)
        return () => window.removeEventListener('scroll', toggle)
    }, [])

    if (!visible) return null

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-4 right-4 bg-amber-900/80 hover:bg-amber-800 text-amber-400 w-10 h-10 rounded-full border border-amber-600 transition z-40"
        >
            ↑
        </button>
    )
}