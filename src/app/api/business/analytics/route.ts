import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export async function GET(req: NextRequest) {
  const supabase = await getServerSupabase()
  const url = new URL(req.url)
  const business_id = url.searchParams.get('business_id')
  if (!business_id) return NextResponse.json({ success: false, error: 'Missing business_id' }, { status: 400 })
  const { data, error } = await supabase
    .from('business_analytics_daily')
    .select('*')
    .eq('business_id', business_id)
    .order('day', { ascending: false })
    .limit(30)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}


