import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id,name,slug,is_active,sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    if (error) throw error
    const res = NextResponse.json({ success: true, data })
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


