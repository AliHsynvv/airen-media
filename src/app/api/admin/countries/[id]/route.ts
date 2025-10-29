import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import slugify from 'slugify'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { data, error } = await supabaseAdmin.from('countries').select('*').eq('id', id).single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const update: any = {
      name: body.name,
      slug: body.slug && body.slug.length ? body.slug : (body.name ? slugify(body.name, { lower: true, strict: true }) : undefined),
      capital: body.capital ?? null,
      featured_image: body.featured_image ?? null,
      status: body.status ?? 'active',
      official_language: body.official_language ?? null,
      currency: body.currency ?? null,
      timezone: body.timezone ?? null,
      culture_description: body.culture_description ?? null,
      visa_info: body.visa_info ?? null,
      popular_activities: body.popular_activities ?? [],
      airen_advice: body.airen_advice ?? null,
      top_places: body.top_places ?? [],
      // Extended fields
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      map_zoom_level: body.map_zoom_level ?? null,
      negative_aspects: body.negative_aspects ?? [],
      famous_foods: body.famous_foods ?? [],
      restaurants: body.restaurants ?? [],
      hotels: body.hotels ?? [],
      total_restaurants: body.total_restaurants ?? null,
      total_hotels: body.total_hotels ?? null,
      average_meal_price: body.average_meal_price ?? null,
      average_hotel_price: body.average_hotel_price ?? null,
    }
    const { data, error } = await supabaseAdmin.from('countries').update(update).eq('id', id).select('*').single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { error } = await supabaseAdmin.from('countries').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}