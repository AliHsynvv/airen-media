import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export async function GET(req: NextRequest) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const limit = Math.max(1, Math.min(200, Number(url.searchParams.get('limit')) || 100))
  const { data, error } = await supabase.rpc('get_notifications_feed', { p_user: user.id, p_limit: limit })
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const res = NextResponse.json({ success: true, data })
  res.headers.set('Cache-Control', 'private, max-age=0, must-revalidate')
  return res
}

export async function PATCH() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}


