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
      currency_code: body.currency_code ?? null,
      timezone: body.timezone ?? null,
      culture_description: body.culture_description ?? null,
      visa_info: body.visa_info ?? null,
      popular_activities: body.popular_activities ?? [],
      popular_cities: body.popular_cities ?? [],
      negatives: body.negatives ?? [],
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      popular_restaurants: body.popular_restaurants ?? [],
      popular_hotels: body.popular_hotels ?? [],
      airen_advice: body.airen_advice ?? null,
      top_places: body.top_places ?? [],
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