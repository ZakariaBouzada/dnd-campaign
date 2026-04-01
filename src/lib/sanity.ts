import { createClient } from '@sanity/client'

export const client = createClient({
    projectId: '98br97cf',        // Your Sanity project ID
    dataset: 'production-dnd',    // Your dataset name
    apiVersion: '2024-04-01',     // Today's date (use current date)
    useCdn: false,                // Set to false for development (true for production)
})