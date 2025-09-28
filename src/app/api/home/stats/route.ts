import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const [countries, users, stories] = await Promise.all([
      supabaseAdmin.from('countries').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('users_profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('user_stories').select('id', { count: 'exact', head: true }).eq('status', 'approved')
    ])
    const res = NextResponse.json({
      success: true,
      data: {
        countries: countries.count || 0,
        travelers: users.count || 0,
        stories: stories.count || 0,
      }
    })
    res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600')
    return res
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


