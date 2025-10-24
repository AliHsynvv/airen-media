import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const [{ count: total }, { count: published }, { count: draft }] = await Promise.all([
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('type', 'news'),
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('type', 'news').eq('status', 'published'),
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('type', 'news').eq('status', 'draft'),
    ])
    return NextResponse.json({ success: true, data: { total: total || 0, published: published || 0, draft: draft || 0 } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


