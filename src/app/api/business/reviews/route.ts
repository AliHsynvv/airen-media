import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export async function PATCH(req: NextRequest) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const { review_id, status, reply } = body || {}
  if (!review_id) return NextResponse.json({ success: false, error: 'Missing review_id' }, { status: 400 })

  // Verify ownership of the business for the review
  const { data: review } = await supabase
    .from('business_reviews')
    .select('id,business_id')
    .eq('id', review_id)
    .maybeSingle()
  if (!review) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })

  const { data: biz } = await supabase
    .from('business_profiles')
    .select('id,owner_id')
    .eq('id', review.business_id)
    .maybeSingle()
  if (!biz || biz.owner_id !== user.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  const update: any = {}
  if (typeof status === 'string') update.status = status
  if (typeof reply === 'string') { update.owner_reply = reply; update.owner_reply_at = new Date().toISOString() }
  if (Object.keys(update).length === 0) return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 })

  const { error } = await supabase.from('business_reviews').update(update).eq('id', review_id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}


