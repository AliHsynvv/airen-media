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
      // Ensure slug is always lowercase and properly formatted
      slug: body.slug && body.slug.length 
        ? slugify(body.slug, { lower: true, strict: true })
        : (body.name ? slugify(body.name, { lower: true, strict: true }) : undefined),
      iso_code: body.iso_code ?? null,
      flag_icon: body.flag_icon ?? null,
      capital: body.capital ?? null,
      population: body.population ?? null,
      featured_image: body.featured_image ?? null,
      status: body.status ?? 'active',
      official_language: body.official_language ?? null,
      currency: body.currency ?? null,
      currency_code: body.currency_code ?? null,
      timezone: body.timezone ?? null,
      best_time_to_visit: body.best_time_to_visit ?? null,
      climate_info: body.climate_info ?? null,
      average_budget: body.average_budget ?? null,
      budget_level: body.budget_level ?? null,
      culture_description: body.culture_description ?? null,
      historical_info: body.historical_info ?? null,
      food_description: body.food_description ?? null,
      local_customs: body.local_customs ?? null,
      visa_info: body.visa_info ?? null,
      entry_requirements: body.entry_requirements ?? null,
      visa_required: body.visa_required ?? null,
      popular_activities: body.popular_activities ?? [],
      popular_cities: body.popular_cities ?? [],
      negatives: body.negatives ?? [],
      popular_restaurants: body.popular_restaurants ?? [],
      popular_hotels: body.popular_hotels ?? [],
      airen_advice: body.airen_advice ?? null,
      top_places: body.top_places ?? [],
      visitors_per_year: body.visitors_per_year ?? null,
      featured: body.featured ?? false,
      // Extended fields
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      // Multi-language support (_i18n fields)
      culture_description_i18n: body.culture_description_i18n ?? null,
      visa_info_i18n: body.visa_info_i18n ?? null,
      entry_requirements_i18n: body.entry_requirements_i18n ?? null,
      airen_advice_i18n: body.airen_advice_i18n ?? null,
      best_time_to_visit_i18n: body.best_time_to_visit_i18n ?? null,
      climate_info_i18n: body.climate_info_i18n ?? null,
      historical_info_i18n: body.historical_info_i18n ?? null,
      food_description_i18n: body.food_description_i18n ?? null,
      local_customs_i18n: body.local_customs_i18n ?? null,
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