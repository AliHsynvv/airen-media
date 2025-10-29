import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'
import slugify from 'slugify'

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  iso_code: z.string().nullable().optional(),
  flag_icon: z.string().nullable().optional(),
  capital: z.string().nullable().optional(),
  population: z.number().nullable().optional(),
  featured_image: z.string().url().nullable().optional(),
  status: z.enum(['active','inactive']).default('active'),
  official_language: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  currency_code: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  best_time_to_visit: z.string().nullable().optional(),
  climate_info: z.string().nullable().optional(),
  average_budget: z.object({ daily: z.number().optional(), weekly: z.number().optional() }).nullable().optional(),
  budget_level: z.enum(['Budget','Mid-range','Luxury']).nullable().optional(),
  culture_description: z.string().nullable().optional(),
  visa_info: z.string().nullable().optional(),
  entry_requirements: z.string().nullable().optional(),
  visa_required: z.boolean().nullable().optional(),
  popular_activities: z.array(z.string()).nullable().optional(),
  popular_cities: z.array(z.string()).nullable().optional(),
  negatives: z.array(z.string()).nullable().optional(),
  popular_restaurants: z.array(z.object({
    name: z.string(),
    image: z.string().url().optional(),
    url: z.string().url().optional(),
    description: z.string().optional(),
    location: z.object({ lat: z.number().optional(), lng: z.number().optional(), address: z.string().optional(), city: z.string().optional() }).optional(),
    rating: z.number().min(0).max(5).optional(),
  })).nullable().optional(),
  popular_hotels: z.array(z.object({
    name: z.string(),
    image: z.string().url().optional(),
    url: z.string().url().optional(),
    description: z.string().optional(),
    location: z.object({ lat: z.number().optional(), lng: z.number().optional(), address: z.string().optional(), city: z.string().optional() }).optional(),
    rating: z.number().min(0).max(5).optional(),
  })).nullable().optional(),
  airen_advice: z.string().nullable().optional(),
  top_places: z.array(z.object({ name: z.string(), description: z.string().optional(), image: z.string().optional() })).nullable().optional(),
  visitors_per_year: z.number().nullable().optional(),
  featured: z.boolean().nullable().optional(),
  trending_score: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  map_zoom_level: z.number().int().nullable().optional(),
  negative_aspects: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    severity: z.enum(['low','medium','high']).optional(),
    category: z.enum(['cost','safety','weather','infrastructure','other']).optional(),
  })).nullable().optional(),
  famous_foods: z.array(z.object({
    name: z.string(),
    local_name: z.string().optional(),
    description: z.string().optional(),
    image_url: z.string().url().optional(),
    price_range: z.string().optional(),
    ingredients: z.array(z.string()).optional(),
    recommended_places: z.array(z.string()).optional(),
    is_vegetarian: z.boolean().optional(),
    is_vegan: z.boolean().optional(),
  })).nullable().optional(),
  restaurants: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    rating: z.number().optional(),
    price_range: z.enum(['$','$$','$$$','$$$$']).optional(),
    cuisine_type: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    opening_hours: z.string().optional(),
    average_meal_cost: z.number().optional(),
  })).nullable().optional(),
  hotels: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    rating: z.number().optional(),
    star_rating: z.number().optional(),
    price_range: z.enum(['$','$$','$$$','$$$$']).optional(),
    price_per_night: z.number().optional(),
    images: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    booking_url: z.string().optional(),
    room_types: z.array(z.string()).optional(),
  })).nullable().optional(),
  total_restaurants: z.number().nullable().optional(),
  total_hotels: z.number().nullable().optional(),
  average_meal_price: z.number().nullable().optional(),
  average_hotel_price: z.number().nullable().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 })
    }
    const p = parsed.data
    const slug = p.slug && p.slug.length ? p.slug : slugify(p.name, { lower: true, strict: true })
    const { data, error } = await supabaseAdmin
      .from('countries')
      .insert({
        name: p.name,
        slug,
        iso_code: p.iso_code ?? null,
        flag_icon: p.flag_icon ?? null,
        capital: p.capital ?? null,
        population: p.population ?? null,
        featured_image: p.featured_image ?? null,
        status: p.status,
        official_language: p.official_language ?? null,
        currency: p.currency ?? null,
        currency_code: p.currency_code ?? null,
        timezone: p.timezone ?? null,
        best_time_to_visit: p.best_time_to_visit ?? null,
        climate_info: p.climate_info ?? null,
        average_budget: p.average_budget ?? null,
        budget_level: p.budget_level ?? null,
        culture_description: p.culture_description ?? null,
        visa_info: p.visa_info ?? null,
        visa_required: p.visa_required ?? null,
        entry_requirements: p.entry_requirements ?? null,
        popular_activities: p.popular_activities ?? [],
        popular_cities: p.popular_cities ?? [],
      negatives: p.negatives ?? [],
      popular_restaurants: p.popular_restaurants ?? [],
      popular_hotels: p.popular_hotels ?? [],
        airen_advice: p.airen_advice ?? null,
        top_places: p.top_places ?? [],
        visitors_per_year: p.visitors_per_year ?? null,
        featured: p.featured ?? false,
        trending_score: p.trending_score ?? 0,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
        map_zoom_level: p.map_zoom_level ?? null,
        negative_aspects: p.negative_aspects ?? [],
        famous_foods: p.famous_foods ?? [],
        restaurants: p.restaurants ?? [],
        hotels: p.hotels ?? [],
        total_restaurants: p.total_restaurants ?? null,
        total_hotels: p.total_hotels ?? null,
        average_meal_price: p.average_meal_price ?? null,
        average_hotel_price: p.average_hotel_price ?? null,
      })
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


