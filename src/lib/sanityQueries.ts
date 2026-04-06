import { client } from './sanity'

export async function getActiveMap() {
    const query = `*[_type == "mapAsset" && isActive == true][0] {
        name,
        "imageUrl": mapImage.asset->url,
        "imageAsset": mapImage.asset,  // ← Add this for the image pipeline
        description
    }`
    return await client.fetch(query)
}

export async function getAllLocations() {
    const query = `*[_type == "location"] {
        _id,
        name,
        type,
        description,
        coordinates,
        faction-> { name, color }
    }`
    const locations = await client.fetch(query)
    return locations.filter((loc: any) => loc.coordinates?.x !== undefined && loc.coordinates?.y !== undefined)
}