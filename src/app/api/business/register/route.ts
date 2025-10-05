import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'

const schema = z.object({
  owner_id: z.string().uuid(),
  name: z.string().min(2),
  category: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  social_instagram: z.string().optional(),
  social_tiktok: z.string().optional(),
  social_facebook: z.string().optional(),
  social_youtube: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: 'Supabase env vars missing' }, { status: 500 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 })
    }

    const payload = parsed.data

    // Ensure owner exists
    const { data: owner, error: ownerErr } = await supabaseAdmin
      .from('users_profiles')
      .select('id, role')
      .eq('id', payload.owner_id)
      .single()
    if (ownerErr || !owner) {
      return NextResponse.json({ success: false, error: 'Owner not found' }, { status: 400 })
    }

    // Insert business profile
    const { data, error } = await supabaseAdmin
      .from('business_profiles')
      .insert({
        owner_id: payload.owner_id,
        name: payload.name,
        category: payload.category ?? null,
        description: payload.description ?? null,
        website: payload.website ?? null,
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        location: payload.location ?? null,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        social_instagram: payload.social_instagram ?? null,
        social_tiktok: payload.social_tiktok ?? null,
        social_facebook: payload.social_facebook ?? null,
        social_youtube: payload.social_youtube ?? null,
        is_active: true,
      })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


