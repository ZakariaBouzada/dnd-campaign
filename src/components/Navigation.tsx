'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
    name: string
    path: string
}

const navItems: NavItem[] = [
    { name: 'Home', path: '/' },
    { name: 'Seasons', path: '/seasons' },
    { name: 'Factions', path: '/factions' },
    { name: 'Timeline', path: '/timeline' },
    { name: 'Map', path: '/map' },
    { name: 'Relationships', path: '/relationships' },
    { name: 'About', path: '/about' },
    { name: 'GM Workshop', path: '/gm-workshop' }
]

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname()

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false)
    }, [pathname])

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMenuOpen])

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    return (
        <>
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-black/95 border-b border-amber-800/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="font-serif text-amber-400 text-xl tracking-wide hover:text-amber-300 transition">
                            Iron Chronicle
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex gap-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`text-sm tracking-wide transition ${
                                        pathname === item.path
                                            ? 'text-amber-400 border-b-2 border-amber-400 pb-1'
                                            : 'text-gray-400 hover:text-amber-300'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 z-50"
                            aria-label="Toggle menu"
                        >
                            <span className={`w-6 h-0.5 bg-amber-400 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`w-6 h-0.5 bg-amber-400 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                            <span className={`w-6 h-0.5 bg-amber-400 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/95 z-40 transition-all duration-300 md:hidden ${
                    isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onClick={toggleMenu}
            />

            {/* Mobile Menu Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-gray-900 to-black border-l border-amber-800/30 z-40 transition-transform duration-300 md:hidden ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="pt-20 px-6">
                    <div className="flex flex-col gap-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={toggleMenu}
                                className={`text-base tracking-wide py-2 transition ${
                                    pathname === item.path
                                        ? 'text-amber-400 border-l-2 border-amber-400 pl-3'
                                        : 'text-gray-400 hover:text-amber-300 pl-3'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}