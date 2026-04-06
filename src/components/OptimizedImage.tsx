'use client'

import { useMemo } from 'react'
import { getOptimizedMapImage } from '@/lib/sanityImage'


interface OptimizedImageProps {
    imageSource: any
    alt: string
    className?: string
    sizes?: string
}

export default function OptimizedImage({ imageSource, alt, className, sizes }: OptimizedImageProps) {
    // useMemo prevents recalculating strings on every tiny mouse move/render
    const imageUrl = useMemo(() => {
        if (!imageSource) return ''
        // Default to a high-quality "fallback"
        return getOptimizedMapImage(imageSource, 1920, 80)
    }, [imageSource])

    // This creates a "srcset" string so the browser decides, not the JS
    const srcSet = useMemo(() => {
        if (!imageSource) return ''
        return `
            ${getOptimizedMapImage(imageSource, 768, 75)} 768w,
            ${getOptimizedMapImage(imageSource, 1920, 80)} 1920w,
            ${getOptimizedMapImage(imageSource, 2560, 80)} 2560w
        `
    }, [imageSource])

    if (!imageUrl) {
        return <div className={`${className} bg-gray-800 animate-pulse`} />
    }

    return (
        <img
            src={imageUrl}
            srcSet={srcSet} // <--- The Browser uses this to be fast
            alt={alt}
            className={className}
            loading="lazy"
            sizes={sizes || '(max-width: 768px) 100vw, 1920px'}
        />
    )
}