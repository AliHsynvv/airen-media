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

/**
 * Generate a grid of search points to cover a large area
 * This overcomes Google's 60-result limit by searching multiple locations
 * 
 * @param centerLat - Center latitude
 * @param centerLng - Center longitude  
 * @param radiusKm - Radius to cover in km
 * @param gridSize - Number of points per side (3 = 9 points, 4 = 16 points)
 * @returns Array of lat/lng search points
 */
function generateSearchGrid(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  gridSize: number = 3
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = []
  
  // Calculate step size in degrees (roughly 111km per degree latitude)
  // Longitude degrees vary by latitude (smaller near poles)
  const stepLat = (radiusKm * 2) / (111 * gridSize)
  const stepLng = (radiusKm * 2) / (111 * Math.cos((centerLat * Math.PI) / 180) * gridSize)
  
  // Generate grid points centered around the given coordinates
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lat = centerLat - radiusKm / 111 + (i * stepLat) + stepLat / 2
      const lng = centerLng - radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180)) + (j * stepLng) + stepLng / 2
      points.push({ lat, lng })
    }
  }
  
  return points
}

interface VenueResult {
  // Basic Info
  name: string
  place_id?: string
  image?: string
  url?: string
  description?: string
  
  // Location
  location?: {
    lat?: number
    lng?: number
    address?: string
    city?: string
    vicinity?: string
  }
  
  // Ratings & Reviews
  rating?: number
  user_ratings_total?: number
  reviews?: Array<{
    author_name: string
    author_photo?: string
    rating: number
    text: string
    time: number
    relative_time_description?: string
  }>
  
  // Contact
  phone?: string
  international_phone?: string
  website?: string
  
  // Pricing
  price_level?: number // 0-4 ($, $$, $$$, $$$$)
  
  // Business Hours
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
    periods?: Array<{
      open: { day: number; time: string }
      close?: { day: number; time: string }
    }>
  }
  
  // Status
  business_status?: string // "OPERATIONAL", "CLOSED_TEMPORARILY", etc.
  
  // Categories
  types?: string[]
  
  // Photos
  photos?: Array<{
    url: string
    width: number
    height: number
    attribution?: string
  }>
  
  // Amenities & Features
  amenities?: {
    // Restaurants
    serves_breakfast?: boolean
    serves_lunch?: boolean
    serves_dinner?: boolean
    serves_brunch?: boolean
    serves_vegetarian_food?: boolean
    takeout?: boolean
    delivery?: boolean
    dine_in?: boolean
    reservable?: boolean
    
    // Hotels
    wifi?: boolean
    parking?: boolean
    pool?: boolean
    gym?: boolean
    spa?: boolean
    pet_friendly?: boolean
    breakfast_included?: boolean
    air_conditioning?: boolean
    
    // General
    wheelchair_accessible_entrance?: boolean
  }
  
  // Additional
  editorial_summary?: string
  icon?: string
  google_maps_url?: string
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
  // Contact
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  url?: string // Google Maps URL
  
  // Hours
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
    periods?: Array<{
      open: { day: number; time: string }
      close?: { day: number; time: string }
    }>
  }
  current_opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  
  // Reviews
  reviews?: Array<{
    author_name: string
    profile_photo_url?: string
    rating: number
    text: string
    time: number
    relative_time_description?: string
    language?: string
  }>
  
  // Status
  business_status?: string
  permanently_closed?: boolean
  
  // Summary
  editorial_summary?: {
    language?: string
    overview?: string
  }
  
  // Visual
  icon?: string
  icon_background_color?: string
  
  // Amenities - Restaurants
  serves_breakfast?: boolean
  serves_lunch?: boolean
  serves_dinner?: boolean
  serves_brunch?: boolean
  serves_vegetarian_food?: boolean
  serves_beer?: boolean
  serves_wine?: boolean
  takeout?: boolean
  delivery?: boolean
  dine_in?: boolean
  reservable?: boolean
  curbside_pickup?: boolean
  
  // Amenities - General
  wheelchair_accessible_entrance?: boolean
  
  // Address components
  address_components?: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  adr_address?: string
  vicinity?: string
  
  // Plus code
  plus_code?: {
    global_code?: string
    compound_code?: string
  }
  
  // Geometry
  geometry: {
    location: {
      lat: number
      lng: number
    }
    viewport?: {
      northeast: { lat: number; lng: number }
      southwest: { lat: number; lng: number }
    }
  }
  
  // UTC offset
  utc_offset_minutes?: number
}

/**
 * Fetch restaurants using Google Places Nearby Search with city-by-city approach
 */
export async function fetchRestaurantsFromGoogle(
  lat: number,
  lng: number,
  radiusMeters: number = 50000, // 50km default
  limit: number = 60, // Max per location
  cities?: string[] // Optional: search each city separately
): Promise<VenueResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not set in environment variables')
  }

  try {
    let allPlaces: GooglePlace[] = []
    const seenPlaceIds = new Set<string>() // Track duplicates

    // Strategy 1: If cities provided, search each city
    if (cities && cities.length > 0) {
      console.log(`🏙️ Searching ${cities.length} cities for restaurants...`)
      
      for (const city of cities) {
        console.log(`  📍 Searching in ${city}...`)
        
        // Text search for better city targeting
        const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+${encodeURIComponent(city)}&key=${apiKey}`
        
        try {
          const response = await fetch(textSearchUrl)
          const data = await response.json()
          
          if (data.status === 'OK' && data.results) {
            const newPlaces = data.results.filter((place: GooglePlace) => {
              if (seenPlaceIds.has(place.place_id)) return false
              seenPlaceIds.add(place.place_id)
              return true
            })
            allPlaces = [...allPlaces, ...newPlaces]
            console.log(`    ✅ Found ${newPlaces.length} new restaurants in ${city} (total: ${allPlaces.length})`)
          }
          
          // Small delay between city searches
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`    ❌ Error searching ${city}:`, error)
        }
      }
    }

    // Strategy 2: Grid-based search to cover entire area (UNLIMITED results!)
    console.log(`🗺️ Grid-based search to cover entire country...`)
    
    // Generate search grid (3x3 = 9 points, 4x4 = 16 points, etc.)
    // Larger countries need bigger grids!
    const gridSize = 5 // 5x5 = 25 search points
    const searchRadius = 15000 // 15km radius per point
    
    const gridPoints = generateSearchGrid(lat, lng, radiusMeters / 1000, gridSize)
    console.log(`  🔲 Generated ${gridPoints.length} grid points (${gridSize}x${gridSize} grid)`)
    
    for (let i = 0; i < gridPoints.length; i++) {
      const point = gridPoints[i]
      console.log(`  📍 Searching grid point ${i + 1}/${gridPoints.length} (${point.lat.toFixed(3)}, ${point.lng.toFixed(3)})...`)
      
      let nextPageToken: string | undefined = undefined
      let pageCount = 0
      const maxPages = 3
      
      do {
        const nearbyUrl: string = nextPageToken
          ? `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
          : `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${point.lat},${point.lng}&radius=${searchRadius}&type=restaurant&key=${apiKey}`
        
        try {
          const nearbyResponse = await fetch(nearbyUrl)
          if (!nearbyResponse.ok) {
            throw new Error(`Google Places API error: ${nearbyResponse.status}`)
          }

          const nearbyData = await nearbyResponse.json()
          
          if (nearbyData.status !== 'OK' && nearbyData.status !== 'ZERO_RESULTS') {
            if (nearbyData.status === 'INVALID_REQUEST' && pageCount > 0) {
              break
            }
            console.log(`    ⚠️ API returned ${nearbyData.status}, skipping this point`)
            break
          }

          if (nearbyData.results && nearbyData.results.length > 0) {
            const newPlaces = nearbyData.results.filter((place: GooglePlace) => {
              if (seenPlaceIds.has(place.place_id)) return false
              seenPlaceIds.add(place.place_id)
              return true
            })
            if (newPlaces.length > 0) {
              allPlaces = [...allPlaces, ...newPlaces]
              console.log(`    ✅ Found ${newPlaces.length} new restaurants (total: ${allPlaces.length})`)
            }
          }

          nextPageToken = nearbyData.next_page_token
          
          if (nextPageToken && pageCount < maxPages) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
          
          pageCount++
        } catch (error) {
          console.error(`    ❌ Error at grid point ${i + 1}:`, error)
          break
        }
        
      } while (nextPageToken && pageCount < maxPages)
      
      // Small delay between grid points
      if (i < gridPoints.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    console.log(`📊 Total fetched: ${allPlaces.length} restaurants`)
    
    // ⚠️ WARNING: If no results found
    if (allPlaces.length === 0) {
      console.error('❌ NO RESULTS FOUND! Possible reasons:')
      console.error('   1. Searching in empty area (desert, ocean, etc.)')
      console.error('   2. No cities provided in popular_cities')
      console.error('   3. Coordinates are incorrect')
      console.error(`   Current search center: (${lat}, ${lng})`)
      console.error('   💡 TIP: Add popular_cities to this country for better results!')
      return []
    }

    // Filter and sort results for quality (only 4.0+ rating restaurants)
    const filteredPlaces = allPlaces
      .filter((place: GooglePlace) => {
        // Must have good rating (4.0+)
        if (!place.rating || place.rating < 4.0) return false
        // Must be popular (50+ reviews)
        if (!place.user_ratings_total || place.user_ratings_total < 50) return false
        // Must have photos
        if (!place.photos || place.photos.length === 0) return false
        return true
      })
      .sort((a: GooglePlace, b: GooglePlace) => {
        // Sort by popularity score (rating × review count)
        const scoreA = (a.rating || 0) * Math.log(a.user_ratings_total || 1)
        const scoreB = (b.rating || 0) * Math.log(b.user_ratings_total || 1)
        return scoreB - scoreA
      })
    
    console.log(`✅ Filtered ${allPlaces.length} restaurants → ${filteredPlaces.length} quality (4.0+) restaurants`)
    
    // Use all filtered places (no limit!)
    const places: GooglePlace[] = filteredPlaces
    console.log(`🚀 UNLIMITED MODE: Processing ${places.length} restaurants`)
    
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
          // Get primary photo
          let photoUrl: string | undefined
          if (place.photos && place.photos.length > 0) {
            photoUrl = getGooglePhotoUrl(place.photos[0].photo_reference, apiKey, 800)
          }
          
          // Get all photos (up to 5)
          const allPhotos = getAllPhotos(details.photos, apiKey, 5)
          
          // Build price description
          const priceLevel = details.price_level !== undefined ? details.price_level : place.price_level
          const priceDescription = priceLevel !== undefined 
            ? '$'.repeat(Math.max(1, priceLevel)) 
            : undefined
          
          // Build enhanced description
          const descriptionParts = [
            details.rating ? `${details.rating}⭐` : place.rating ? `${place.rating}⭐` : null,
            details.user_ratings_total ? `${details.user_ratings_total} reviews` : place.user_ratings_total ? `${place.user_ratings_total} reviews` : null,
            priceDescription,
            details.opening_hours?.open_now ? '🟢 Open now' : details.opening_hours?.open_now === false ? '🔴 Closed' : null,
          ].filter(Boolean).join(' • ')
          
          const venue: VenueResult = {
            // Basic
            name: place.name,
            place_id: place.place_id,
            url: details.website || details.url || '',
            image: photoUrl || '',
            description: descriptionParts || undefined,
            
            // Location
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              address: details.formatted_address || place.vicinity || '',
              city: city,
              vicinity: details.vicinity || place.vicinity,
            },
            
            // Ratings & Reviews
            rating: details.rating || place.rating,
            user_ratings_total: details.user_ratings_total || place.user_ratings_total,
            reviews: details.reviews?.slice(0, 5).map(review => ({
              author_name: review.author_name,
              author_photo: review.profile_photo_url,
              rating: review.rating,
              text: review.text,
              time: review.time,
              relative_time_description: review.relative_time_description,
            })),
            
            // Contact
            phone: details.formatted_phone_number || details.international_phone_number || '',
            international_phone: details.international_phone_number,
            website: details.website || '',
            
            // Pricing
            price_level: priceLevel,
            
            // Business Hours
            opening_hours: details.opening_hours ? {
              open_now: details.opening_hours.open_now,
              weekday_text: details.opening_hours.weekday_text,
              periods: details.opening_hours.periods,
            } : undefined,
            
            // Status
            business_status: details.business_status,
            
            // Categories
            types: details.types || place.types,
            
            // Photos
            photos: allPhotos.length > 0 ? allPhotos : undefined,
            
            // Amenities
            amenities: {
              // Restaurant specific
              serves_breakfast: details.serves_breakfast,
              serves_lunch: details.serves_lunch,
              serves_dinner: details.serves_dinner,
              serves_brunch: details.serves_brunch,
              serves_vegetarian_food: details.serves_vegetarian_food,
              takeout: details.takeout,
              delivery: details.delivery,
              dine_in: details.dine_in,
              reservable: details.reservable,
              wheelchair_accessible_entrance: details.wheelchair_accessible_entrance,
            },
            
            // Additional
            editorial_summary: details.editorial_summary?.overview,
            icon: details.icon,
            google_maps_url: details.url,
          }
          
          venues.push(venue)
          
          // 🧪 TEST: Log first venue to check all fields
          if (venues.length === 1) {
            console.log('🧪 FIRST RESTAURANT SAMPLE:', JSON.stringify(venue, null, 2))
          }
        }
      })
      
      // Add small delay between batches to be respectful to API
      if (i + 5 < places.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    console.log(`🎯 Total venues created: ${venues.length}`)
    return venues
  } catch (error) {
    console.error('Error fetching restaurants from Google Places:', error)
    throw error
  }
}

/**
 * Fetch hotels using Google Places Nearby Search with city-by-city approach
 */
export async function fetchHotelsFromGoogle(
  lat: number,
  lng: number,
  radiusMeters: number = 50000, // 50km default
  limit: number = 60, // Max per location
  cities?: string[] // Optional: search each city separately
): Promise<VenueResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not set in environment variables')
  }

  try {
    let allPlaces: GooglePlace[] = []
    const seenPlaceIds = new Set<string>() // Track duplicates

    // Strategy 1: If cities provided, search each city
    if (cities && cities.length > 0) {
      console.log(`🏙️ Searching ${cities.length} cities for hotels...`)
      
      for (const city of cities) {
        console.log(`  📍 Searching in ${city}...`)
        
        // Text search for better city targeting
        const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=hotels+in+${encodeURIComponent(city)}&key=${apiKey}`
        
        try {
          const response = await fetch(textSearchUrl)
          const data = await response.json()
          
          if (data.status === 'OK' && data.results) {
            const newPlaces = data.results.filter((place: GooglePlace) => {
              if (seenPlaceIds.has(place.place_id)) return false
              seenPlaceIds.add(place.place_id)
              return true
            })
            allPlaces = [...allPlaces, ...newPlaces]
            console.log(`    ✅ Found ${newPlaces.length} new hotels in ${city} (total: ${allPlaces.length})`)
          }
          
          // Small delay between city searches
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`    ❌ Error searching ${city}:`, error)
        }
      }
    }

    // Strategy 2: Grid-based search to cover entire area (UNLIMITED results!)
    console.log(`🗺️ Grid-based search to cover entire country...`)
    
    // Generate search grid (3x3 = 9 points, 4x4 = 16 points, etc.)
    // Larger countries need bigger grids!
    const gridSize = 5 // 5x5 = 25 search points
    const searchRadius = 15000 // 15km radius per point
    
    const gridPoints = generateSearchGrid(lat, lng, radiusMeters / 1000, gridSize)
    console.log(`  🔲 Generated ${gridPoints.length} grid points (${gridSize}x${gridSize} grid)`)
    
    for (let i = 0; i < gridPoints.length; i++) {
      const point = gridPoints[i]
      console.log(`  📍 Searching grid point ${i + 1}/${gridPoints.length} (${point.lat.toFixed(3)}, ${point.lng.toFixed(3)})...`)
      
      let nextPageToken: string | undefined = undefined
      let pageCount = 0
      const maxPages = 3
      
      do {
        const nearbyUrl: string = nextPageToken
          ? `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
          : `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${point.lat},${point.lng}&radius=${searchRadius}&type=lodging&key=${apiKey}`
        
        try {
          const nearbyResponse = await fetch(nearbyUrl)
          if (!nearbyResponse.ok) {
            throw new Error(`Google Places API error: ${nearbyResponse.status}`)
          }

          const nearbyData = await nearbyResponse.json()
          
          if (nearbyData.status !== 'OK' && nearbyData.status !== 'ZERO_RESULTS') {
            if (nearbyData.status === 'INVALID_REQUEST' && pageCount > 0) {
              break
            }
            console.log(`    ⚠️ API returned ${nearbyData.status}, skipping this point`)
            break
          }

          if (nearbyData.results && nearbyData.results.length > 0) {
            const newPlaces = nearbyData.results.filter((place: GooglePlace) => {
              if (seenPlaceIds.has(place.place_id)) return false
              seenPlaceIds.add(place.place_id)
              return true
            })
            if (newPlaces.length > 0) {
              allPlaces = [...allPlaces, ...newPlaces]
              console.log(`    ✅ Found ${newPlaces.length} new hotels (total: ${allPlaces.length})`)
            }
          }

          nextPageToken = nearbyData.next_page_token
          
          if (nextPageToken && pageCount < maxPages) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
          
          pageCount++
        } catch (error) {
          console.error(`    ❌ Error at grid point ${i + 1}:`, error)
          break
        }
        
      } while (nextPageToken && pageCount < maxPages)
      
      // Small delay between grid points
      if (i < gridPoints.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    console.log(`📊 Total fetched: ${allPlaces.length} hotels`)
    
    // ⚠️ WARNING: If no results found
    if (allPlaces.length === 0) {
      console.error('❌ NO RESULTS FOUND! Possible reasons:')
      console.error('   1. Searching in empty area (desert, ocean, etc.)')
      console.error('   2. No cities provided in popular_cities')
      console.error('   3. Coordinates are incorrect')
      console.error(`   Current search center: (${lat}, ${lng})`)
      console.error('   💡 TIP: Add popular_cities to this country for better results!')
      return []
    }

    // Filter and sort results for quality (only 4.0+ rating hotels)
    const filteredPlaces = allPlaces
      .filter((place: GooglePlace) => {
        // Must have good rating (4.0+)
        if (!place.rating || place.rating < 4.0) return false
        // Must be popular (30+ reviews for hotels)
        if (!place.user_ratings_total || place.user_ratings_total < 30) return false
        // Must have photos
        if (!place.photos || place.photos.length === 0) return false
        return true
      })
      .sort((a: GooglePlace, b: GooglePlace) => {
        // Sort by popularity score (rating × review count)
        const scoreA = (a.rating || 0) * Math.log(a.user_ratings_total || 1)
        const scoreB = (b.rating || 0) * Math.log(b.user_ratings_total || 1)
        return scoreB - scoreA
      })
    
    console.log(`✅ Filtered ${allPlaces.length} hotels → ${filteredPlaces.length} quality (4.0+) hotels`)
    
    // Use all filtered places (no limit!)
    const places: GooglePlace[] = filteredPlaces
    console.log(`🚀 UNLIMITED MODE: Processing ${places.length} hotels`)
    
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
          
          // Get primary photo
          let photoUrl: string | undefined
          if (place.photos && place.photos.length > 0) {
            photoUrl = getGooglePhotoUrl(place.photos[0].photo_reference, apiKey, 800)
          }
          
          // Get all photos (up to 5)
          const allPhotos = getAllPhotos(details.photos, apiKey, 5)
          
          // Build price description
          const priceLevel = details.price_level !== undefined ? details.price_level : place.price_level
          const priceDescription = priceLevel !== undefined 
            ? '$'.repeat(Math.max(1, priceLevel)) 
            : undefined
          
          // Build enhanced description
          const descriptionParts = [
            details.rating ? `${details.rating}⭐` : place.rating ? `${place.rating}⭐` : null,
            details.user_ratings_total ? `${details.user_ratings_total} reviews` : place.user_ratings_total ? `${place.user_ratings_total} reviews` : null,
            priceDescription,
            details.opening_hours?.open_now ? '🟢 Open now' : details.opening_hours?.open_now === false ? '🔴 Closed' : null,
          ].filter(Boolean).join(' • ')
          
          const venue: VenueResult = {
            // Basic
            name: place.name,
            place_id: place.place_id,
            url: details.website || details.url || '',
            image: photoUrl || '',
            description: descriptionParts || undefined,
            
            // Location
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              address: details.formatted_address || place.vicinity || '',
              city: city,
              vicinity: details.vicinity || place.vicinity,
            },
            
            // Ratings & Reviews
            rating: details.rating || place.rating,
            user_ratings_total: details.user_ratings_total || place.user_ratings_total,
            reviews: details.reviews?.slice(0, 5).map(review => ({
              author_name: review.author_name,
              author_photo: review.profile_photo_url,
              rating: review.rating,
              text: review.text,
              time: review.time,
              relative_time_description: review.relative_time_description,
            })),
            
            // Contact
            phone: details.formatted_phone_number || details.international_phone_number || '',
            international_phone: details.international_phone_number,
            website: details.website || '',
            
            // Pricing
            price_level: priceLevel,
            
            // Business Hours
            opening_hours: details.opening_hours ? {
              open_now: details.opening_hours.open_now,
              weekday_text: details.opening_hours.weekday_text,
              periods: details.opening_hours.periods,
            } : undefined,
            
            // Status
            business_status: details.business_status,
            
            // Categories
            types: details.types || place.types,
            
            // Photos
            photos: allPhotos.length > 0 ? allPhotos : undefined,
            
            // Amenities
            amenities: {
              // Hotel specific (Note: These might not all be available from Google Places API)
              wifi: undefined, // Not directly available
              parking: undefined, // Not directly available
              pool: undefined, // Not directly available
              gym: undefined, // Not directly available
              spa: undefined, // Not directly available
              pet_friendly: undefined, // Not directly available
              breakfast_included: undefined, // Not directly available
              air_conditioning: undefined, // Not directly available
              
              // General
              wheelchair_accessible_entrance: details.wheelchair_accessible_entrance,
            },
            
            // Additional
            editorial_summary: details.editorial_summary?.overview,
            icon: details.icon,
            google_maps_url: details.url,
          }
          
          venues.push(venue)
          
          // 🧪 TEST: Log first venue to check all fields
          if (venues.length === 1) {
            console.log('🧪 FIRST RESTAURANT SAMPLE:', JSON.stringify(venue, null, 2))
          }
        }
      })
      
      // Add small delay between batches
      if (i + 5 < places.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    console.log(`🎯 Total venues created: ${venues.length}`)
    return venues
  } catch (error) {
    console.error('Error fetching hotels from Google Places:', error)
    throw error
  }
}

/**
 * Fetch place details using Place Details API with ALL available fields
 */
async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<GooglePlaceDetails | null> {
  try {
    // Request valid fields that work with Google Places API
    // Split into groups to avoid issues
    const fields = [
      // Basic Info (always available)
      'place_id',
      'name',
      'formatted_address',
      'geometry',
      'types',
      'vicinity',
      'url',
      'icon',
      
      // Contact (Contact Data tier)
      'formatted_phone_number',
      'international_phone_number',
      'website',
      
      // Hours (Basic tier)
      'opening_hours',
      'business_status',
      
      // Reviews & Ratings (Atmosphere tier)
      'rating',
      'user_ratings_total',
      'price_level',
      'reviews',
      
      // Photos (Basic tier)
      'photos',
      
      // Editorial (Atmosphere tier)
      'editorial_summary',
      
      // Amenities (Atmosphere tier - some may not be available)
      'serves_breakfast',
      'serves_lunch',
      'serves_dinner',
      'serves_vegetarian_food',
      'takeout',
      'delivery',
      'dine_in',
      'reservable',
      'wheelchair_accessible_entrance',
    ].join(',')
    
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`
    
    const response = await fetch(detailsUrl)
    if (!response.ok) {
      console.error(`Failed to fetch details for place ${placeId}`)
      return null
    }

    const data = await response.json()
    
    if (data.status !== 'OK') {
      console.error(`Place details error for ${placeId}: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`)
      
      // Return null but don't throw - we'll skip this place
      return null
    }

    return data.result
  } catch (error: any) {
    console.error(`Error fetching place details for ${placeId}:`, error?.message || error)
    
    // Return null instead of throwing to allow other places to continue
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
 * Get all photos from place
 */
function getAllPhotos(
  photos: Array<{ photo_reference: string; width: number; height: number }> | undefined,
  apiKey: string,
  maxPhotos: number = 5
): Array<{ url: string; width: number; height: number }> {
  if (!photos || photos.length === 0) return []
  
  return photos.slice(0, maxPhotos).map(photo => ({
    url: getGooglePhotoUrl(photo.photo_reference, apiKey, 1200),
    width: photo.width,
    height: photo.height
  }))
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
