import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const articleId = req.nextUrl.searchParams.get('articleId')
    if (!articleId) return NextResponse.json({ success: false, error: 'articleId required' }, { status: 400 })
    const { count, error } = await supabaseAdmin
      .from('article_likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId)
    if (error) throw error
    return NextResponse.json({ success: true, data: { count: count || 0 } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


