import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { business_id, title, content, scheduled_at, media_ids } = body || {}
  if (!business_id) return NextResponse.json({ success: false, error: 'Missing business_id' }, { status: 400 })

  // Verify owner
  const { data: biz } = await supabase
    .from('business_profiles')
    .select('id,owner_id')
    .eq('id', business_id)
    .maybeSingle()
  if (!biz || biz.owner_id !== user.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  const postTitle = typeof title === 'string' && title.trim().length > 0
    ? title.trim()
    : `Post ${new Date().toISOString().slice(0, 10)}`
  const payload: any = { business_id, title: postTitle, content: content ?? null, status: scheduled_at ? 'scheduled' : 'draft', created_by: user.id }
  if (scheduled_at) payload.scheduled_at = scheduled_at

  const { data, error } = await supabaseAdmin.from('business_posts').insert(payload).select('*').single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  const post = data

  // Link media if provided
  if (Array.isArray(media_ids) && media_ids.length > 0 && post?.id) {
    const rows = media_ids.map((mid: string, idx: number) => ({ post_id: post.id, media_id: mid, position: idx }))
    const { error: linkErr } = await supabaseAdmin.from('business_post_media').insert(rows)
    if (linkErr) return NextResponse.json({ success: false, error: linkErr.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, data: post })
}


