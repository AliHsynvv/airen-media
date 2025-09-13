import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import slugify from 'slugify'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabaseAdmin.from('countries').select('*').eq('id', params.id).single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
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
    }
    const { data, error } = await supabaseAdmin.from('countries').update(update).eq('id', params.id).select('*').single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabaseAdmin.from('countries').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


