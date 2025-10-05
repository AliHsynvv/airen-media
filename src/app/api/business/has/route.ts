import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export async function GET() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ has: false })
  const { data } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()
  return NextResponse.json({ has: !!data })
}


