import { createClient } from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'

export const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '98br97cf',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production-dnd',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-04-01',
    useCdn: false,
    perspective: 'published',
    ignoreBrowserTokenWarning: true,
    token: typeof window === 'undefined' ? process.env.NEXT_PUBLIC_SANITY_API_WRITE_TOKEN : undefined,
})

// Image URL builder for Sanity images
const builder = createImageUrlBuilder(client)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
    if (!source) return null
    return builder.image(source)
}

// Helper function to get optimized map image
export function getOptimizedMapImage(imageSource: any, width?: number, quality?: number) {
    if (!imageSource) return null

    let urlBuilder = urlFor(imageSource)
    if (!urlBuilder) return null

    // Auto format to WebP (smaller file size)
    urlBuilder = urlBuilder.format('webp')

    // Set width if provided
    if (width) {
        urlBuilder = urlBuilder.width(width)
    } else {
        urlBuilder = urlBuilder.width(1920) // Max width for desktop
    }

    // Set quality (80 is good balance)
    if (quality) {
        urlBuilder = urlBuilder.quality(quality)
    } else {
        urlBuilder = urlBuilder.quality(80)
    }

    // Fit to width (maintains aspect ratio)
    urlBuilder = urlBuilder.fit('max')

    return urlBuilder.url()
}