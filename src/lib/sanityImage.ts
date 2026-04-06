import imageUrlBuilder from '@sanity/image-url'
import { client } from './sanity'

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
    return builder.image(source)
}

// Helper function to get optimized map image
export function getOptimizedMapImage(imageSource: any, width?: number, quality?: number) {
    let urlBuilder = urlFor(imageSource)

    // Auto format to WebP (smaller file size)
    urlBuilder = urlBuilder.format('webp')

    // Set width if provided (defaults to responsive)
    if (width) {
        urlBuilder = urlBuilder.width(width)
    } else {
        // Use responsive sizes based on viewport
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