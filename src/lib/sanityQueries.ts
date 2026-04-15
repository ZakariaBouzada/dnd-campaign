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

export async function getAllFactionsForSeason(seasonId: number) {
    console.log(`🏰 Fetching only factions relevant to season ${seasonId}...`)

    const query = `*[_type == "faction" && count(territories[season->.seasonNumber == $seasonId]) > 0] {
        _id,
        name,
        symbol,
        color,
        tagline,
        goals,
        // We still fetch the territory data here
        "territoryData": territories[season->.seasonNumber == $seasonId][0].territoryData {
            type,
            polygonPoints[] { x, y },
            arrows[] {
                point { x, y },
                direction,
                label
            }
        }
    }`

    const factions = await client.fetch(query, { seasonId })
    return factions
}
export async function getAllCharacters() {
    const query = `*[_type == "character"] | order(name asc) {
        _id,
        name,
        role,
        type,
        race,
        class,
        hp,
        ac,
        traits,
        backstory,
        location-> { name },
        seasons[]-> { seasonNumber, title }
    }`
    return await client.fetch(query)
}
export async function getAllSessions() {
    const query = `*[_type == "session"] | order(date asc) {
        _id,
        sessionNumber,
        title,
        summary,
        date,
        season-> { seasonNumber, title },
        keyEvents,
        charactersPresent[]-> { name }
    }`
    return await client.fetch(query)
}

// Define the interface so TS knows what an 'Arc' is
export interface Arc {
    _id: string;
    _type: string;
    name: string;
    subtitle?: string;
    description?: string;
    coverImageUrl?: string;
    rawMapImage?: any; // The raw image object for urlFor()
    factions?: any[];
    locations?: any[];
    mapData?: {
        imageUrl: string;
        parentImageUrl?: string;
        cropArea?: any;
        isFullMap?: boolean;
    };
    featuredCharacters?: Array<{
        _id: string;
        name: string;
        role?: string;
        imageUrl?: string;
    }>;
    processedMap?: {
        imageAsset: any;
        pixelCrop: any;
        crop: any;
    };
}

export async function getArc(): Promise<Arc | null> {
    const activeArcId = await client.fetch(`*[_type == "arc" && isActive == true][0]._id`);

    if (!activeArcId) {
        console.error("❌ No active arc found in Sanity.");
        return null;
    }
    const query = `*[_type == "arc" && _id == $arcId][0] {
        _id,
        _type,
        name,
        subtitle,
        description,
        "coverImageUrl": coverImage.asset->url,
        "rawMapImage": mapImage->mapImage, 
            
        // 1. Improved Location Filter: Use references() and allow drafts
        "locations": *[_type == "location" && references($arcId)] {
            _id,
            name,
            type,
            description,
            // We look into the arcCoordinates array for a match with our current Arc ID
            "coordinates": arcCoordinates[arc._ref == $arcId || arc._ref == "drafts." + $arcId][0].coordinates { 
                x, 
                y 
            },
            faction-> { 
                name, 
                color 
            }
        },

        // 2. Improved Faction Filter: Use references() and allow drafts
        "factions": *[_type == "faction" && references(^._id)] {
            _id,
            name,
            color,
            symbol,
            tagline,
            "targetArcId": ^._id,     
            // The actual data we want
           "territoryData": arcTerritories[arc._ref == $arcId || arc._ref == "drafts." + $arcId][0].territoryData {
                type,
                "polygonPoints": polygonPoints[] { x, y },
                "arrows": arrows[] {
                    point { x, y },
                    direction,
                    label
                }
            }
        },

        "mapData": mapImage-> {
            "name": name,
            "imageAsset": mapImage.asset,
            "imageMetadata": mapImage.asset->metadata,
            "parentImageAsset": parentMap->mapImage.asset,
            "parentImageMetadata": parentMap->mapImage.asset->metadata,
            cropArea,
            isFullMap
        },

        "featuredCharacters": featuredCharacters[]-> {
            _id,
            name,
            role,
            "imageUrl": portrait.asset->url
        }
    }`

    const result = await client.fetch(query, { arcId: activeArcId })

    if (!result) return null

    // Process the pixel crop logic right here inside the fetch function
    // This keeps your page.tsx clean
    const map = result.mapData
    let imageAsset = map?.isFullMap ? map.imageAsset : (map?.parentImageAsset || map?.imageAsset)
    let imageMetadata = map?.isFullMap ? map.imageMetadata : (map?.parentImageMetadata || map?.imageMetadata)
    let crop = map?.isFullMap ? null : map?.cropArea

    let pixelCrop = null
    if (crop && imageMetadata?.dimensions) {
        const { width, height } = imageMetadata.dimensions
        pixelCrop = {
            x: Math.round((crop.x / 100) * width),
            y: Math.round((crop.y / 100) * height),
            width: Math.round((crop.width / 100) * width),
            height: Math.round((crop.height / 100) * height)
        }

    }
    return {
        ...result,
        processedMap: {
            imageAsset,
            pixelCrop,
            crop
        }
    }
}
export async function getCampaignStats() {
    const query = `{
        "totalSeasons": count(*[_type == "season"]),
        "totalCharacters": count(*[_type == "character"]),
        "totalFactions": count(*[_type == "faction"]),
        "totalLocations": count(*[_type == "location"]),
        "totalSessions": count(*[_type == "session"])
    }`
    return await client.fetch(query)
}