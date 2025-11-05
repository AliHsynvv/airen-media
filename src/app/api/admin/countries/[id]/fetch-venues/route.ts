import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import {
  fetchRestaurantsFromGoogle,
  fetchHotelsFromGoogle,
  isGooglePlacesAvailable,
} from '@/lib/utils/google-places-fetcher'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/countries/[id]/fetch-venues
 * Automatically fetch restaurants and hotels from free open sources
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { type } = body // 'restaurants' or 'hotels'

    if (!type || !['restaurants', 'hotels'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "restaurants" or "hotels"' },
        { status: 400 }
      )
    }

    // Fetch country data
    const { data: country, error: countryError } = await supabaseAdmin
      .from('countries')
      .select('id, name, iso_code, latitude, longitude, popular_cities')
      .eq('id', id)
      .single()

    if (countryError || !country) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      )
    }

    let venues: any[] = []

    try {
      // Check if Google Places API is available
      if (!isGooglePlacesAvailable()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Google Places API key is not configured. Please add GOOGLE_PLACES_API_KEY to your .env.local file.',
          },
          { status: 400 }
        )
      }

      // Check if coordinates are available
      if (!country.latitude || !country.longitude) {
        return NextResponse.json(
          {
            success: false,
            error: `Country ${country.name} does not have coordinates. Please add latitude and longitude.`,
          },
          { status: 400 }
        )
      }

      console.log(`🌟 Fetching ${type} from Google Places for ${country.name}...`)
      
      // Extract city names from popular_cities (supports both text[] and JSONB formats)
      let cities: string[] = []
      if (country.popular_cities && Array.isArray(country.popular_cities)) {
        cities = country.popular_cities.map((city: any) => {
          // If JSONB format: {name: "Sydney", ...} → extract name
          if (typeof city === 'object' && city.name) {
            return city.name
          }
          // If text[] format: "Sydney" → use directly
          if (typeof city === 'string') {
            return city
          }
          return null
        }).filter(Boolean) as string[]
      }
      
      console.log(cities.length > 0 
        ? `🏙️ Will search ${cities.length} cities: ${cities.join(', ')}` 
        : '🗺️ No cities found, using country coordinates only'
      )
      
      // Fetch from Google Places
      if (type === 'restaurants') {
        venues = await fetchRestaurantsFromGoogle(
          country.latitude,
          country.longitude,
          50000, // 50km radius
          60, // Max per location
          cities // City-by-city search for unlimited results
        )
      } else {
        venues = await fetchHotelsFromGoogle(
          country.latitude,
          country.longitude,
          50000, // 50km radius
          60, // Max per location
          cities // City-by-city search for unlimited results
        )
      }
      
      if (venues.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `No quality ${type} (4.0+ rating) found for ${country.name}. The area may not have enough highly-rated venues.`,
          },
          { status: 404 }
        )
      }

      console.log(`✅ Successfully fetched ${venues.length} quality ${type} (4.0+ rating) from Google Places`)
      
      // 🧪 TEST: Log first raw venue from Google
      if (venues.length > 0) {
        console.log('🧪 FIRST RAW VENUE FROM GOOGLE:', JSON.stringify(venues[0], null, 2))
      }

      // Format venues for database - SAVE ALL FIELDS! 🎯
      const formattedVenues = venues.map((venue) => ({
        // Basic Info
        name: venue.name,
        place_id: venue.place_id,
        image: venue.image || '',
        url: venue.website || venue.url || '',
        description: venue.description || '',
        
        // Location
        location: venue.location || {},
        
        // Ratings & Reviews
        rating: venue.rating,
        user_ratings_total: venue.user_ratings_total,
        reviews: venue.reviews,
        
        // Contact
        phone: venue.phone,
        international_phone: venue.international_phone,
        website: venue.website,
        
        // Pricing
        price_level: venue.price_level,
        
        // Business Hours
        opening_hours: venue.opening_hours,
        
        // Status
        business_status: venue.business_status,
        
        // Categories
        types: venue.types,
        
        // Photos (all 5)
        photos: venue.photos,
        
        // Amenities
        amenities: venue.amenities,
        
        // Additional
        editorial_summary: venue.editorial_summary,
        icon: venue.icon,
        google_maps_url: venue.google_maps_url,
      }))
      
      // 🧪 TEST: Log first formatted venue before saving
      if (formattedVenues.length > 0) {
        console.log('🧪 FIRST FORMATTED VENUE (to be saved):', JSON.stringify(formattedVenues[0], null, 2))
      }

      // Update the country with the fetched venues
      const updateField = type === 'restaurants' ? 'popular_restaurants' : 'popular_hotels'
      
      const { error: updateError } = await supabaseAdmin
        .from('countries')
        .update({
          [updateField]: formattedVenues,
        })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating country:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update country with fetched venues' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          count: formattedVenues.length,
          venues: formattedVenues,
          source: 'Google Places API',
        },
        message: `Successfully fetched ${formattedVenues.length} quality ${type} (4.0+) from Google Places`,
      })
    } catch (apiError: any) {
      console.error('Error fetching venues from APIs:', apiError)
      
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch ${type} from external APIs: ${apiError.message}`,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in fetch-venues API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

