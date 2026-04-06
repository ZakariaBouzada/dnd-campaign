import { client } from './sanity'

export async function getActiveMapForSeason(seasonId: number) {
    const query = `*[_type == "mapAsset" && isActive == true && season->.seasonNumber == $seasonId][0] {
        name,
        "imageAsset": mapImage.asset,
        "parentImageAsset": parentMap->mapImage.asset,
        "parentImageMetadata": parentMap->mapImage.asset->metadata,
        cropArea,
        isFullMap,
        season-> {
            seasonNumber,
            title
        }
    }`
    const result = await client.fetch(query, { seasonId })
    console.log('Active map for season', seasonId, ':', result)  // ← Add this

    if (!result) return null

    // Determine which image asset to use
    let imageAsset = null
    let imageMetadata = null
    let crop = null

    if (result.isFullMap) {
        // Full map: use its own image
        imageAsset = result.imageAsset
        imageMetadata = result.imageMetadata
    } else if (result.parentImageAsset) {
        // Cropped map: use parent's image with crop area
        imageAsset = result.parentImageAsset
        imageMetadata = result.parentImageMetadata
        crop = result.cropArea
    }

    let pixelCrop = null
    if (crop && imageMetadata) {
        const imgWidth = imageMetadata.dimensions.width
        const imgHeight = imageMetadata.dimensions.height

        pixelCrop = {
            x: Math.round((crop.x / 100) * imgWidth),
            y: Math.round((crop.y / 100) * imgHeight),
            width: Math.round((crop.width / 100) * imgWidth),
            height: Math.round((crop.height / 100) * imgHeight)
        }
    }

    return {
        name: result.name,
        imageAsset: imageAsset,
        imageMetadata: imageMetadata,
        crop: crop,
        pixelCrop: pixelCrop,
        season: result.season
    }
}
export async function getAllLocationsForSeason(seasonId: number) {
    console.log(`🔍 Fetching locations for season ${seasonId}...`)

    const query = `*[_type == "location"] {
        _id,
        name,
        type,
        description,
        "coordinates": seasonCoordinates[season->.seasonNumber == $seasonId][0].coordinates,
        faction-> { name, color }
    }`

    const locations = await client.fetch(query, { seasonId })
    console.log(`📍 Query result:`, locations.map((l: any) => ({ name: l.name, coords: l.coordinates })))

    const validLocations = locations.filter((loc: any) => {
        const hasCoords = loc.coordinates?.x !== undefined && loc.coordinates?.y !== undefined
        if (hasCoords) {
            console.log(`   ✅ ${loc.name}: (${loc.coordinates.x}%, ${loc.coordinates.y}%)`)
        } else {
            console.log(`   ❌ ${loc.name}: No coordinates for season ${seasonId}`)
        }
        return hasCoords
    })

    console.log(`📍 Valid locations for season ${seasonId}: ${validLocations.length}`)
    return validLocations
}