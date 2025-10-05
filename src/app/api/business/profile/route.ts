import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export async function PATCH(req: NextRequest) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const { id, ...rest } = body || {}
  if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })

  // Verify owner
  const { data: biz } = await supabase.from('business_profiles').select('id,owner_id').eq('id', id).maybeSingle()
  if (!biz || biz.owner_id !== user.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  const payload: any = {
    name: rest.name ?? undefined,
    category: rest.category ?? undefined,
    description: rest.description ?? undefined,
    website: rest.website ?? undefined,
    email: rest.email ?? undefined,
    phone: rest.phone ?? undefined,
    location: rest.location ?? undefined,
    latitude: typeof rest.latitude === 'number' ? rest.latitude : undefined,
    longitude: typeof rest.longitude === 'number' ? rest.longitude : undefined,
    social_instagram: rest.social_instagram ?? undefined,
    social_tiktok: rest.social_tiktok ?? undefined,
    social_facebook: rest.social_facebook ?? undefined,
    social_youtube: rest.social_youtube ?? undefined,
  }

  const { error } = await supabase.from('business_profiles').update(payload).eq('id', id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}


