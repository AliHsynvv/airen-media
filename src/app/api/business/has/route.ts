import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export async function GET() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ has: false })
  
  // Check if user has business account type
  const { data: profile } = await supabase
    .from('users_profiles')
    .select('account_type')
    .eq('id', user.id)
    .single()
  
  return NextResponse.json({ has: profile?.account_type === 'business' })
}


