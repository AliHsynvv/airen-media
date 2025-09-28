import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: 'Supabase env vars missing' }, { status: 500 })
    }
    const { articleId } = await req.json()
    if (!articleId || typeof articleId !== 'string') {
      return NextResponse.json({ success: false, error: 'articleId required' }, { status: 400 })
    }

    // Prefer RPC if exists
    const { data: incData, error: incErr } = await supabaseAdmin.rpc('increment_article_views', { a_id: articleId })
    if (!incErr) {
      const res = NextResponse.json({ success: true, data: { view_count: incData as number } })
      res.headers.set('Cache-Control', 'no-store')
      return res
    }
    // Fallback: read-modify-write (non-atomic, but acceptable as fallback)
    const { data: current, error: readErr } = await supabaseAdmin
      .from('articles')
      .select('view_count')
      .eq('id', articleId)
      .single()
    if (readErr) throw readErr
    const newCount = (current?.view_count || 0) + 1
    const { error: updErr } = await supabaseAdmin
      .from('articles')
      .update({ view_count: newCount })
      .eq('id', articleId)
    if (updErr) throw updErr
    const res = NextResponse.json({ success: true, data: { view_count: newCount } })
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


