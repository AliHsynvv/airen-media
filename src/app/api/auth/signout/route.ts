import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export async function POST() {
  try {
    const supabase = await getServerSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    // Return OK; cookies are cleared by supabase client via server-ssr helpers
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'signout_failed' }, { status: 500 })
  }
}


