import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { user_id, type, payload } = body || {}
    if (!user_id || !type) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }

    const safePayload = {
      ...(payload && typeof payload === 'object' ? payload : {}),
      actor_id: user.id,
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({ user_id, type, payload: safePayload })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}


