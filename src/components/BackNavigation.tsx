'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BackNavigationProps {
    showHome?: boolean
    customBackPath?: string
    customBackLabel?: string
    useBrowserBack?: boolean  // ← New prop to control behavior
}

export default function BackNavigation({
                                           showHome = true,
                                           customBackPath,
                                           customBackLabel,
                                           useBrowserBack = true  // Default to browser back
                                       }: BackNavigationProps) {
    const router = useRouter()

    const handleBack = () => {
        if (useBrowserBack) {
            router.back()
        }
    }

    return (
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-amber-800/30">
            <div className="flex items-center gap-3">
                {/* Back Button - uses Link if customBackPath provided, otherwise router.back */}
                {customBackPath ? (
                    <Link
                        href={customBackPath}
                        className="flex items-center gap-1 text-amber-600 hover:text-amber-400 transition text-sm group"
                    >
                        <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
                        <span>{customBackLabel || 'Back'}</span>
                    </Link>
                ) : (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 text-amber-600 hover:text-amber-400 transition text-sm group"
                    >
                        <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
                        <span>{customBackLabel || 'Back'}</span>
                    </button>
                )}
            </div>

            {/* Home Link - always a direct Link */}
            {showHome && (
                <Link
                    href="/"
                    className="text-xs text-gray-500 hover:text-amber-400 transition flex items-center gap-1"
                >
                    <span>🏠</span> Home
                </Link>
            )}
        </div>
    )
}