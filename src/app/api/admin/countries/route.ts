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
  airen_advice: z.string().nullable().optional(),
  top_places: z.array(z.object({ name: z.string(), description: z.string().optional(), image: z.string().optional() })).nullable().optional(),
  visitors_per_year: z.number().nullable().optional(),
  featured: z.boolean().nullable().optional(),
  trending_score: z.number().nullable().optional(),
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
        airen_advice: p.airen_advice ?? null,
        top_places: p.top_places ?? [],
        visitors_per_year: p.visitors_per_year ?? null,
        featured: p.featured ?? false,
        trending_score: p.trending_score ?? 0,
      })
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


