import { createClient } from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'

export const client = createClient({
    projectId: '98br97cf',
    dataset: 'production-dnd',
    apiVersion: '2024-04-01',
    useCdn: false,
})

// Image URL builder for Sanity images
const builder = createImageUrlBuilder(client)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
    if (!source) return null
    return builder.image(source)
}