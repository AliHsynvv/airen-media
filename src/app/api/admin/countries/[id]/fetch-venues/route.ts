import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import {
  fetchRestaurantsFromOSM,
  fetchHotelsFromOSM,
  fetchRestaurantsByCoordinates,
  fetchHotelsByCoordinates,
} from '@/lib/utils/venue-fetcher'
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
      .select('id, name, iso_code, latitude, longitude')
      .eq('id', id)
      .single()

    if (countryError || !country) {
      return NextResponse.json(
        { success: false, error: 'Country not found' },
        { status: 404 }
      )
    }

    let venues: any[] = []
    let dataSource = 'Unknown'

    try {
      // Strategy 1: Try Google Places first (best quality) - requires coordinates
      if (isGooglePlacesAvailable() && country.latitude && country.longitude) {
        console.log(`🔍 Attempting to fetch ${type} from Google Places for ${country.name}...`)
        
        try {
          if (type === 'restaurants') {
            venues = await fetchRestaurantsFromGoogle(
              country.latitude,
              country.longitude,
              50000, // 50km radius
              20
            )
          } else {
            venues = await fetchHotelsFromGoogle(
              country.latitude,
              country.longitude,
              50000, // 50km radius
              20
            )
          }
          
          if (venues.length > 0) {
            dataSource = 'Google Places API'
            console.log(`✅ Successfully fetched ${venues.length} ${type} from Google Places`)
          }
        } catch (googleError: any) {
          console.error('Google Places API error:', googleError.message)
          console.log('⚠️ Falling back to OpenStreetMap...')
        }
      } else if (isGooglePlacesAvailable()) {
        console.log('⚠️ Google Places requires coordinates, falling back to OpenStreetMap...')
      } else {
        console.log('⚠️ Google Places API key not found, using OpenStreetMap...')
      }

      // Strategy 2: Fallback to OpenStreetMap if Google Places failed or unavailable
      if (venues.length === 0 && country.iso_code) {
        console.log(`Fetching ${type} for ${country.name} (${country.iso_code}) from OpenStreetMap using ISO code...`)
        
        if (type === 'restaurants') {
          venues = await fetchRestaurantsFromOSM(country.iso_code, 20)
        } else {
          venues = await fetchHotelsFromOSM(country.iso_code, 20)
        }
        
        if (venues.length > 0) {
          dataSource = 'OpenStreetMap (ISO code)'
        }
      }

      // Strategy 3: Last resort - try by coordinates
      if (venues.length === 0 && country.latitude && country.longitude) {
        console.log(`Fetching ${type} for ${country.name} from OpenStreetMap using coordinates...`)
        
        if (type === 'restaurants') {
          venues = await fetchRestaurantsByCoordinates(
            country.latitude,
            country.longitude,
            100, // 100km radius
            20
          )
        } else {
          venues = await fetchHotelsByCoordinates(
            country.latitude,
            country.longitude,
            100, // 100km radius
            20
          )
        }
        
        if (venues.length > 0) {
          dataSource = 'OpenStreetMap (coordinates)'
        }
      }

      if (venues.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `No ${type} found for this country. Please make sure the country has an ISO code or coordinates set.`,
          },
          { status: 404 }
        )
      }

      // Format venues for database
      const formattedVenues = venues.map((venue) => ({
        name: venue.name,
        image: venue.image || '',
        url: venue.website || '',
        description: venue.description || '',
        location: venue.location || {},
      }))

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
          source: dataSource,
        },
        message: `Successfully fetched ${formattedVenues.length} ${type} from ${dataSource}`,
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

