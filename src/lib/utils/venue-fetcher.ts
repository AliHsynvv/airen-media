/**
 * Venue Fetcher Utility
 * Fetches restaurant and hotel data from free/open sources:
 * - OpenStreetMap via Overpass API
 * - Wikidata for images
 * - OpenTripMap for additional data
 */

interface VenueResult {
  name: string
  image?: string
  url?: string
  description?: string
  location?: {
    lat?: number
    lng?: number
    address?: string
    city?: string
  }
  rating?: number
  phone?: string
  website?: string
}

interface OverpassElement {
  type: string
  id: number
  lat?: number
  lon?: number
  tags?: {
    name?: string
    'name:en'?: string
    'addr:street'?: string
    'addr:housenumber'?: string
    'addr:city'?: string
    'addr:postcode'?: string
    phone?: string
    'phone:mobile'?: string
    website?: string
    url?: string
    'contact:website'?: string
    'contact:phone'?: string
    'contact:url'?: string
    cuisine?: string
    stars?: string
    rooms?: string
    description?: string
    wikipedia?: string
    wikidata?: string
    image?: string
    'image:url'?: string
  }
  center?: {
    lat: number
    lon: number
  }
}

interface OverpassResponse {
  elements: OverpassElement[]
}

/**
 * Fetch restaurants from OpenStreetMap using Overpass API
 */
export async function fetchRestaurantsFromOSM(
  countryISOCode: string,
  limit: number = 20
): Promise<VenueResult[]> {
  try {
    // Overpass API query to find restaurants in a country
    const query = `
      [out:json][timeout:25];
      area["ISO3166-1"="${countryISOCode.toUpperCase()}"][admin_level=2];
      (
        node["amenity"="restaurant"](area);
        way["amenity"="restaurant"](area);
        relation["amenity"="restaurant"](area);
      );
      out center ${limit};
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data: OverpassResponse = await response.json()
    
    // Process and format the results
    const venues: VenueResult[] = []
    const wikidataElements: { element: OverpassElement; index: number }[] = []
    
    // First, collect all venues
    for (const element of data.elements) {
      if (!element.tags?.name) continue
      
      const lat = element.lat || element.center?.lat
      const lon = element.lon || element.center?.lon
      
      // Get website URL from multiple possible fields
      const websiteUrl = element.tags.website || 
                        element.tags['contact:website'] || 
                        element.tags.url ||
                        element.tags['contact:url']
      
      // Get phone from multiple possible fields
      const phoneNumber = element.tags.phone || 
                         element.tags['contact:phone'] || 
                         element.tags['phone:mobile']
      
      // Get image URL if available directly in OSM
      const imageUrl = element.tags.image || 
                      element.tags['image:url'] ||
                      undefined
      
      const venue: VenueResult = {
        name: element.tags.name,
        url: websiteUrl, // Map to 'url' field for database
        image: imageUrl, // Direct image from OSM
        phone: phoneNumber,
        website: websiteUrl,
        location: {
          lat,
          lng: lon,
          address: buildAddress(element.tags),
          city: element.tags['addr:city'],
        },
        description: element.tags.cuisine ? `Cuisine: ${element.tags.cuisine}` : undefined,
      }
      
      venues.push(venue)
      
      // Collect elements with wikidata for image fetching
      if (element.tags.wikidata && !imageUrl) {
        wikidataElements.push({ element, index: venues.length - 1 })
      }
    }
    
    // Fetch images from Wikidata for venues that don't have images (max 10 to avoid slow requests)
    if (wikidataElements.length > 0) {
      const elementsToFetch = wikidataElements.slice(0, 10)
      console.log(`Fetching images from Wikidata for ${elementsToFetch.length} venues...`)
      
      const imageFetchPromises = elementsToFetch.map(async ({ element, index }) => {
        try {
          if (element.tags?.wikidata) {
            const image = await fetchWikidataImage(element.tags.wikidata)
            if (image && venues[index]) {
              venues[index].image = image
            }
          }
        } catch (error) {
          console.error(`Failed to fetch Wikidata image for ${venues[index]?.name}:`, error)
        }
      })
      
      await Promise.allSettled(imageFetchPromises)
    }
    
    return venues
  } catch (error) {
    console.error('Error fetching restaurants from OSM:', error)
    throw error
  }
}

/**
 * Fetch hotels from OpenStreetMap using Overpass API
 */
export async function fetchHotelsFromOSM(
  countryISOCode: string,
  limit: number = 20
): Promise<VenueResult[]> {
  try {
    // Overpass API query to find hotels in a country
    const query = `
      [out:json][timeout:25];
      area["ISO3166-1"="${countryISOCode.toUpperCase()}"][admin_level=2];
      (
        node["tourism"="hotel"](area);
        way["tourism"="hotel"](area);
        relation["tourism"="hotel"](area);
      );
      out center ${limit};
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data: OverpassResponse = await response.json()
    
    // Process and format the results
    const venues: VenueResult[] = []
    const wikidataElements: { element: OverpassElement; index: number }[] = []
    
    // First, collect all venues
    for (const element of data.elements) {
      if (!element.tags?.name) continue
      
      const lat = element.lat || element.center?.lat
      const lon = element.lon || element.center?.lon
      
      // Get website URL from multiple possible fields
      const websiteUrl = element.tags.website || 
                        element.tags['contact:website'] || 
                        element.tags.url ||
                        element.tags['contact:url']
      
      // Get phone from multiple possible fields
      const phoneNumber = element.tags.phone || 
                         element.tags['contact:phone'] || 
                         element.tags['phone:mobile']
      
      // Get image URL if available directly in OSM
      const imageUrl = element.tags.image || 
                      element.tags['image:url'] ||
                      undefined
      
      const venue: VenueResult = {
        name: element.tags.name,
        url: websiteUrl, // Map to 'url' field for database
        image: imageUrl, // Direct image from OSM
        phone: phoneNumber,
        website: websiteUrl,
        location: {
          lat,
          lng: lon,
          address: buildAddress(element.tags),
          city: element.tags['addr:city'],
        },
        description: element.tags.stars 
          ? `${element.tags.stars} star hotel` 
          : element.tags.rooms 
            ? `${element.tags.rooms} rooms` 
            : undefined,
      }
      
      venues.push(venue)
      
      // Collect elements with wikidata for image fetching
      if (element.tags.wikidata && !imageUrl) {
        wikidataElements.push({ element, index: venues.length - 1 })
      }
    }
    
    // Fetch images from Wikidata for venues that don't have images (max 10 to avoid slow requests)
    if (wikidataElements.length > 0) {
      const elementsToFetch = wikidataElements.slice(0, 10)
      console.log(`Fetching images from Wikidata for ${elementsToFetch.length} hotels...`)
      
      const imageFetchPromises = elementsToFetch.map(async ({ element, index }) => {
        try {
          if (element.tags?.wikidata) {
            const image = await fetchWikidataImage(element.tags.wikidata)
            if (image && venues[index]) {
              venues[index].image = image
            }
          }
        } catch (error) {
          console.error(`Failed to fetch Wikidata image for ${venues[index]?.name}:`, error)
        }
      })
      
      await Promise.allSettled(imageFetchPromises)
    }
    
    return venues
  } catch (error) {
    console.error('Error fetching hotels from OSM:', error)
    throw error
  }
}

/**
 * Fetch additional venues from OpenTripMap API
 */
export async function fetchVenuesFromOpenTripMap(
  lat: number,
  lng: number,
  radius: number = 5000, // meters
  kind: 'restaurants' | 'accomodations',
  limit: number = 10
): Promise<VenueResult[]> {
  try {
    // OpenTripMap API (free tier, requires API key but we'll use basic endpoints)
    // Note: You might need to get a free API key from opentripmap.com
    const kindQuery = kind === 'restaurants' ? 'foods' : 'accomodations'
    
    const response = await fetch(
      `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lng}&lat=${lat}&kinds=${kindQuery}&limit=${limit}&format=json`
    )

    if (!response.ok) {
      console.warn('OpenTripMap API not available, skipping...')
      return []
    }

    const data = await response.json()
    
    const venues: VenueResult[] = data.map((item: any) => ({
      name: item.name || 'Unknown',
      location: {
        lat: item.point?.lat,
        lng: item.point?.lon,
      },
    }))
    
    return venues
  } catch (error) {
    console.error('Error fetching from OpenTripMap:', error)
    return []
  }
}

/**
 * Fetch image from Wikidata entity
 */
async function fetchWikidataImage(wikidataId: string): Promise<string | null> {
  try {
    const query = `
      SELECT ?image WHERE {
        wd:${wikidataId} wdt:P18 ?image.
      }
      LIMIT 1
    `
    
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`
    
    const response = await fetch(url)
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.results?.bindings?.length > 0) {
      return data.results.bindings[0].image.value
    }
    
    return null
  } catch (error) {
    console.error('Error fetching Wikidata image:', error)
    return null
  }
}

/**
 * Build formatted address from OSM tags
 */
function buildAddress(tags: Record<string, string | undefined>): string {
  const parts = []
  
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
  if (tags['addr:street']) parts.push(tags['addr:street'])
  if (tags['addr:city']) parts.push(tags['addr:city'])
  if (tags['addr:postcode']) parts.push(tags['addr:postcode'])
  
  return parts.join(', ')
}

/**
 * Fetch venues using country coordinates (fallback when ISO code doesn't work well)
 */
export async function fetchRestaurantsByCoordinates(
  lat: number,
  lng: number,
  radiusKm: number = 100,
  limit: number = 20
): Promise<VenueResult[]> {
  try {
    const radiusMeters = radiusKm * 1000
    
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
        way["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
      );
      out center ${limit};
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data: OverpassResponse = await response.json()
    
    const venues: VenueResult[] = []
    const wikidataElements: { element: OverpassElement; index: number }[] = []
    
    for (const element of data.elements) {
      if (!element.tags?.name) continue
      
      const lat = element.lat || element.center?.lat
      const lon = element.lon || element.center?.lon
      
      // Get website URL from multiple possible fields
      const websiteUrl = element.tags.website || 
                        element.tags['contact:website'] || 
                        element.tags.url ||
                        element.tags['contact:url']
      
      // Get phone from multiple possible fields
      const phoneNumber = element.tags.phone || 
                         element.tags['contact:phone'] || 
                         element.tags['phone:mobile']
      
      // Get image URL if available directly in OSM
      const imageUrl = element.tags.image || 
                      element.tags['image:url'] ||
                      undefined
      
      const venue: VenueResult = {
        name: element.tags.name,
        url: websiteUrl,
        image: imageUrl,
        phone: phoneNumber,
        website: websiteUrl,
        location: {
          lat,
          lng: lon,
          address: buildAddress(element.tags),
          city: element.tags['addr:city'],
        },
        description: element.tags.cuisine ? `Cuisine: ${element.tags.cuisine}` : undefined,
      }
      
      venues.push(venue)
      
      // Collect elements with wikidata for image fetching
      if (element.tags.wikidata && !imageUrl) {
        wikidataElements.push({ element, index: venues.length - 1 })
      }
    }
    
    // Fetch images from Wikidata (max 10)
    if (wikidataElements.length > 0) {
      const elementsToFetch = wikidataElements.slice(0, 10)
      const imageFetchPromises = elementsToFetch.map(async ({ element, index }) => {
        try {
          if (element.tags?.wikidata) {
            const image = await fetchWikidataImage(element.tags.wikidata)
            if (image && venues[index]) venues[index].image = image
          }
        } catch (error) {
          console.error(`Failed to fetch Wikidata image:`, error)
        }
      })
      await Promise.allSettled(imageFetchPromises)
    }
    
    return venues
  } catch (error) {
    console.error('Error fetching restaurants by coordinates:', error)
    throw error
  }
}

/**
 * Fetch hotels using country coordinates (fallback when ISO code doesn't work well)
 */
export async function fetchHotelsByCoordinates(
  lat: number,
  lng: number,
  radiusKm: number = 100,
  limit: number = 20
): Promise<VenueResult[]> {
  try {
    const radiusMeters = radiusKm * 1000
    
    const query = `
      [out:json][timeout:25];
      (
        node["tourism"="hotel"](around:${radiusMeters},${lat},${lng});
        way["tourism"="hotel"](around:${radiusMeters},${lat},${lng});
      );
      out center ${limit};
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data: OverpassResponse = await response.json()
    
    const venues: VenueResult[] = []
    const wikidataElements: { element: OverpassElement; index: number }[] = []
    
    for (const element of data.elements) {
      if (!element.tags?.name) continue
      
      const lat = element.lat || element.center?.lat
      const lon = element.lon || element.center?.lon
      
      // Get website URL from multiple possible fields
      const websiteUrl = element.tags.website || 
                        element.tags['contact:website'] || 
                        element.tags.url ||
                        element.tags['contact:url']
      
      // Get phone from multiple possible fields
      const phoneNumber = element.tags.phone || 
                         element.tags['contact:phone'] || 
                         element.tags['phone:mobile']
      
      // Get image URL if available directly in OSM
      const imageUrl = element.tags.image || 
                      element.tags['image:url'] ||
                      undefined
      
      const venue: VenueResult = {
        name: element.tags.name,
        url: websiteUrl,
        image: imageUrl,
        phone: phoneNumber,
        website: websiteUrl,
        location: {
          lat,
          lng: lon,
          address: buildAddress(element.tags),
          city: element.tags['addr:city'],
        },
        description: element.tags.stars 
          ? `${element.tags.stars} star hotel` 
          : element.tags.rooms 
            ? `${element.tags.rooms} rooms` 
            : undefined,
      }
      
      venues.push(venue)
      
      // Collect elements with wikidata for image fetching
      if (element.tags.wikidata && !imageUrl) {
        wikidataElements.push({ element, index: venues.length - 1 })
      }
    }
    
    // Fetch images from Wikidata (max 10)
    if (wikidataElements.length > 0) {
      const elementsToFetch = wikidataElements.slice(0, 10)
      const imageFetchPromises = elementsToFetch.map(async ({ element, index }) => {
        try {
          if (element.tags?.wikidata) {
            const image = await fetchWikidataImage(element.tags.wikidata)
            if (image && venues[index]) venues[index].image = image
          }
        } catch (error) {
          console.error(`Failed to fetch Wikidata image:`, error)
        }
      })
      await Promise.allSettled(imageFetchPromises)
    }
    
    return venues
  } catch (error) {
    console.error('Error fetching hotels by coordinates:', error)
    throw error
  }
}

