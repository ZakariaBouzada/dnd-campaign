import { createClient } from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'

export const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '98br97cf',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production-dnd',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-04-01',
    useCdn: false,
    perspective: 'published',
    ignoreBrowserTokenWarning: true,
})

// Image URL builder for Sanity images
const builder = createImageUrlBuilder(client)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
    if (!source) return null
    return builder.image(source)
}