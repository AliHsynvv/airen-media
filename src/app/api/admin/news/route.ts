import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'all'
    const limitParam = url.searchParams.get('limit')
    const limit = Math.max(1, Math.min(5000, Number(limitParam) || 100))

    let query = supabaseAdmin
      .from('articles')
      .select('id,title,slug,status,published_at,type')
      .eq('type', 'news')
      .order('id', { ascending: false })
      .limit(limit)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


