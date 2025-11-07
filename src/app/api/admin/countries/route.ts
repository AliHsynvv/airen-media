import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'
import slugify from 'slugify'

async function generateUniqueSlug(base: string) {
  const baseSlug = slugify(base, { lower: true, strict: true })
  // Fetch existing slugs that start with the base slug
  const { data, error } = await supabaseAdmin
    .from('countries')
    .select('slug')
    .ilike('slug', `${baseSlug}%`)
    .limit(1000)
  if (error || !data || data.length === 0) {
    return baseSlug
  }
  const existing = new Set<string>(data.map((r: any) => r.slug))
  if (!existing.has(baseSlug)) return baseSlug
  let maxSuffix = 1
  for (const s of existing) {
    const match = s.match(new RegExp(`^${baseSlug}-(\\d+)$`))
    if (match) {
      const n = parseInt(match[1], 10)
      if (!Number.isNaN(n) && n > maxSuffix) maxSuffix = n
    }
  }
  return `${baseSlug}-${maxSuffix + 1}`
}

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  iso_code: z.string().nullable().optional(),
  flag_icon: z.string().nullable().optional(),
  capital: z.string().nullable().optional(),
  population: z.number().nullable().optional(),
  featured_image: z.string().url().or(z.literal('')).nullable().optional(),
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
    image: z.string().url().or(z.literal('')).optional(),
    url: z.string().url().or(z.literal('')).optional(),
    description: z.string().optional(),
    location: z.object({ lat: z.number().optional(), lng: z.number().optional(), address: z.string().optional(), city: z.string().optional() }).optional(),
    rating: z.number().min(0).max(5).optional(),
  })).nullable().optional(),
  popular_hotels: z.array(z.object({
    name: z.string(),
    image: z.string().url().or(z.literal('')).optional(),
    url: z.string().url().or(z.literal('')).optional(),
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
  // Multi-language fields (values may be null when untranslated)
  culture_description_i18n: z.record(z.string(), z.string().nullable()).nullable().optional(),
  visa_info_i18n: z.record(z.string(), z.string().nullable()).nullable().optional(),
  entry_requirements_i18n: z.record(z.string(), z.string().nullable()).nullable().optional(),
  airen_advice_i18n: z.record(z.string(), z.string().nullable()).nullable().optional(),
  best_time_to_visit_i18n: z.record(z.string(), z.string().nullable()).nullable().optional(),
  climate_info_i18n: z.record(z.string(), z.string().nullable()).nullable().optional(),
  historical_info_i18n: z.record(z.string(), z.string().nullable()).nullable().optional(),
  food_description_i18n: z.record(z.string(), z.string().nullable()).nullable().optional(),
  local_customs_i18n: z.record(z.string(), z.string().nullable()).nullable().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 })
    }
    const p = parsed.data
    
    // Check if ISO code already exists (if provided)
    if (p.iso_code) {
      const { data: existing } = await supabaseAdmin
        .from('countries')
        .select('id, name')
        .eq('iso_code', p.iso_code)
        .single()
      if (existing) {
        return NextResponse.json({ 
          success: false, 
          error: `ISO code '${p.iso_code}' is already used by ${existing.name}` 
        }, { status: 400 })
      }
    }
    
    // Ensure slug is always lowercase, properly formatted and unique
    const baseForSlug = p.slug && p.slug.length
      ? p.slug
      : p.name
    const slug = await generateUniqueSlug(baseForSlug)
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
        // Multi-language support
        culture_description_i18n: p.culture_description_i18n ?? null,
        visa_info_i18n: p.visa_info_i18n ?? null,
        entry_requirements_i18n: p.entry_requirements_i18n ?? null,
        airen_advice_i18n: p.airen_advice_i18n ?? null,
        best_time_to_visit_i18n: p.best_time_to_visit_i18n ?? null,
        climate_info_i18n: p.climate_info_i18n ?? null,
        historical_info_i18n: p.historical_info_i18n ?? null,
        food_description_i18n: p.food_description_i18n ?? null,
        local_customs_i18n: p.local_customs_i18n ?? null,
      })
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


