import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  const body = await req.json().catch(() => ({}))

  // Fetch post and verify ownership via business
  const { data: post, error: postErr } = await supabase
    .from('business_posts')
    .select('id,business_id,created_by')
    .eq('id', id)
    .maybeSingle()
  if (postErr || !post) return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
  const { data: biz } = await supabase
    .from('business_profiles')
    .select('id,owner_id')
    .eq('id', post.business_id)
    .maybeSingle()
  if (!biz || (biz.owner_id !== user.id && post.created_by !== user.id)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  const payload: any = {}
  if (typeof body.title === 'string') payload.title = body.title
  if (typeof body.content === 'string' || body.content === null) payload.content = body.content ?? null
  if (typeof body.status === 'string') payload.status = body.status
  if (typeof body.scheduled_at === 'string' || body.scheduled_at === null) payload.scheduled_at = body.scheduled_at ?? null
  if (typeof body.published_at === 'string' || body.published_at === null) payload.published_at = body.published_at ?? null

  if (Object.keys(payload).length === 0) return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 })

  const { error } = await supabaseAdmin.from('business_posts').update(payload).eq('id', id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}


