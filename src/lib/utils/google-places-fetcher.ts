/**
 * Google Places API Venue Fetcher
 * 
 * Much better data quality than OpenStreetMap:
 * - 90%+ venues have photos
 * - 80%+ have websites and phone numbers
 * - Ratings and reviews included
 * - Business hours, price levels, etc.
 * 
 * Pricing: First $200/month FREE
 * - ~6,250 free nearby searches per month
 * - ~11,750 free place details per month
 * 
 * Required: GOOGLE_PLACES_API_KEY in .env.local
 */

/**
 * Check if Google Places API is available (API key is set)
 */
export function isGooglePlacesAvailable(): boolean {
  return !!process.env.GOOGLE_PLACES_API_KEY
}

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

interface GooglePlace {
  place_id: string
  name: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  vicinity?: string
  formatted_address?: string
  rating?: number
  user_ratings_total?: number
  price_level?: number
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  types?: string[]
}

interface GooglePlaceDetails extends GooglePlace {
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  opening_hours?: {
    open_now: boolean
    weekday_text: string[]
  }
  reviews?: Array<{
    author_name: string
    rating: number
    text: string
  }>
}

/**
 * Fetch restaurants using Google Places Nearby Search
 */
export async function fetchRestaurantsFromGoogle(
  lat: number,
  lng: number,
  radiusMeters: number = 50000, // 50km default
  limit: number = 20
): Promise<VenueResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not set in environment variables')
  }

  try {
    // Step 1: Nearby Search to get list of restaurants
    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=restaurant&key=${apiKey}`
    
    const nearbyResponse = await fetch(nearbyUrl)
    if (!nearbyResponse.ok) {
      throw new Error(`Google Places API error: ${nearbyResponse.status}`)
    }

    const nearbyData = await nearbyResponse.json()
    
    if (nearbyData.status !== 'OK' && nearbyData.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${nearbyData.status} - ${nearbyData.error_message || ''}`)
    }

    if (!nearbyData.results || nearbyData.results.length === 0) {
      return []
    }

    // Get top results (limited)
    const places: GooglePlace[] = nearbyData.results.slice(0, limit)
    
    // Step 2: Fetch details for each place (in batches to avoid overwhelming API)
    const venues: VenueResult[] = []
    
    // Process in batches of 5 to be respectful to API
    for (let i = 0; i < places.length; i += 5) {
      const batch = places.slice(i, i + 5)
      const batchPromises = batch.map(place => fetchPlaceDetails(place.place_id, apiKey))
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const details = result.value
          const place = batch[index]
          
          // Get city from address
          const city = extractCityFromAddress(details.formatted_address || place.vicinity || '')
          
          // Get photo URL if available
          let photoUrl: string | undefined
          if (place.photos && place.photos.length > 0) {
            photoUrl = getGooglePhotoUrl(place.photos[0].photo_reference, apiKey, 800)
          }
          
          const venue: VenueResult = {
            name: place.name,
            url: details.website || '',
            image: photoUrl || '',
            phone: details.formatted_phone_number || details.international_phone_number || '',
            website: details.website || '',
            rating: place.rating,
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              address: details.formatted_address || place.vicinity || '',
              city: city,
            },
            description: place.rating 
              ? `Rating: ${place.rating}⭐ (${place.user_ratings_total || 0} reviews)` 
              : undefined,
          }
          
          venues.push(venue)
        }
      })
      
      // Add small delay between batches to be respectful to API
      if (i + 5 < places.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    return venues
  } catch (error) {
    console.error('Error fetching restaurants from Google Places:', error)
    throw error
  }
}

/**
 * Fetch hotels using Google Places Nearby Search
 */
export async function fetchHotelsFromGoogle(
  lat: number,
  lng: number,
  radiusMeters: number = 50000, // 50km default
  limit: number = 20
): Promise<VenueResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not set in environment variables')
  }

  try {
    // Step 1: Nearby Search to get list of hotels
    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=lodging&key=${apiKey}`
    
    const nearbyResponse = await fetch(nearbyUrl)
    if (!nearbyResponse.ok) {
      throw new Error(`Google Places API error: ${nearbyResponse.status}`)
    }

    const nearbyData = await nearbyResponse.json()
    
    if (nearbyData.status !== 'OK' && nearbyData.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${nearbyData.status} - ${nearbyData.error_message || ''}`)
    }

    if (!nearbyData.results || nearbyData.results.length === 0) {
      return []
    }

    // Get top results (limited)
    const places: GooglePlace[] = nearbyData.results.slice(0, limit)
    
    // Step 2: Fetch details for each place (in batches)
    const venues: VenueResult[] = []
    
    // Process in batches of 5
    for (let i = 0; i < places.length; i += 5) {
      const batch = places.slice(i, i + 5)
      const batchPromises = batch.map(place => fetchPlaceDetails(place.place_id, apiKey))
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const details = result.value
          const place = batch[index]
          
          // Get city from address
          const city = extractCityFromAddress(details.formatted_address || place.vicinity || '')
          
          // Get photo URL if available
          let photoUrl: string | undefined
          if (place.photos && place.photos.length > 0) {
            photoUrl = getGooglePhotoUrl(place.photos[0].photo_reference, apiKey, 800)
          }
          
          // Determine price level description
          let priceDescription = ''
          if (place.price_level !== undefined) {
            priceDescription = getPriceLevelDescription(place.price_level)
          }
          
          const venue: VenueResult = {
            name: place.name,
            url: details.website || '',
            image: photoUrl || '',
            phone: details.formatted_phone_number || details.international_phone_number || '',
            website: details.website || '',
            rating: place.rating,
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              address: details.formatted_address || place.vicinity || '',
              city: city,
            },
            description: [
              place.rating ? `Rating: ${place.rating}⭐` : null,
              priceDescription || null,
              place.user_ratings_total ? `${place.user_ratings_total} reviews` : null,
            ].filter(Boolean).join(' • '),
          }
          
          venues.push(venue)
        }
      })
      
      // Add small delay between batches
      if (i + 5 < places.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    return venues
  } catch (error) {
    console.error('Error fetching hotels from Google Places:', error)
    throw error
  }
}

/**
 * Fetch place details using Place Details API
 */
async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<GooglePlaceDetails | null> {
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,international_phone_number,website,formatted_address,opening_hours&key=${apiKey}`
    
    const response = await fetch(detailsUrl)
    if (!response.ok) {
      console.error(`Failed to fetch details for place ${placeId}`)
      return null
    }

    const data = await response.json()
    
    if (data.status !== 'OK') {
      console.error(`Place details error for ${placeId}: ${data.status}`)
      return null
    }

    return data.result
  } catch (error) {
    console.error(`Error fetching place details for ${placeId}:`, error)
    return null
  }
}

/**
 * Get Google Place Photo URL
 */
function getGooglePhotoUrl(
  photoReference: string,
  apiKey: string,
  maxWidth: number = 800
): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`
}

/**
 * Extract city from formatted address
 */
function extractCityFromAddress(address: string): string {
  // Try to extract city from address
  // Format: "Street, City, State/Province, Country"
  const parts = address.split(',').map(p => p.trim())
  
  if (parts.length >= 2) {
    // Usually city is the second-to-last or second part
    return parts[parts.length - 2] || parts[1] || ''
  }
  
  return ''
}

/**
 * Get price level description
 */
function getPriceLevelDescription(priceLevel: number): string {
  const levels: Record<number, string> = {
    0: 'Free',
    1: 'Budget ($)',
    2: 'Mid-range ($$)',
    3: 'Expensive ($$$)',
    4: 'Very Expensive ($$$$)',
  }
  
  return levels[priceLevel] || ''
}

/**
 * Search restaurants by country name (using Text Search)
 * More expensive but works without coordinates
 */
export async function searchRestaurantsByCountry(
  countryName: string,
  limit: number = 20
): Promise<VenueResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not set in environment variables')
  }

  try {
    const query = `restaurants in ${countryName}`
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
    
    const response = await fetch(searchUrl)
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`)
    }

    if (!data.results || data.results.length === 0) {
      return []
    }

    const places: GooglePlace[] = data.results.slice(0, limit)
    
    // Fetch details for each place
    const venues: VenueResult[] = []
    
    for (let i = 0; i < places.length; i += 5) {
      const batch = places.slice(i, i + 5)
      const batchPromises = batch.map(place => fetchPlaceDetails(place.place_id, apiKey))
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const details = result.value
          const place = batch[index]
          
          const city = extractCityFromAddress(details.formatted_address || place.vicinity || '')
          let photoUrl: string | undefined
          if (place.photos && place.photos.length > 0) {
            photoUrl = getGooglePhotoUrl(place.photos[0].photo_reference, apiKey, 800)
          }
          
          venues.push({
            name: place.name,
            url: details.website || '',
            image: photoUrl || '',
            phone: details.formatted_phone_number || '',
            website: details.website || '',
            rating: place.rating,
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              address: details.formatted_address || place.vicinity || '',
              city: city,
            },
            description: place.rating ? `Rating: ${place.rating}⭐` : undefined,
          })
        }
      })
      
      if (i + 5 < places.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    return venues
  } catch (error) {
    console.error('Error searching restaurants:', error)
    throw error
  }
}
