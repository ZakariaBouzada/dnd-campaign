// src/lib/sanityAdmin.ts
import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '98br97cf'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production-dnd'

// Force it to look for the NEXT_PUBLIC version which the browser can actually see
const token = process.env.NEXT_PUBLIC_SANITY_API_WRITE_TOKEN

export const adminClient = createClient({
    projectId,
    dataset,
    apiVersion: '2024-04-01',
    useCdn: false,
    token: token,
    perspective: 'published',
    // ADD THIS LINE: It tells Sanity it's okay to use a token in the browser
    ignoreBrowserTokenWarning: true,
})