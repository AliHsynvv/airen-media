import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_stories')
      .select('id,slug,title,content,image_url,image_alt,category,tags,status,created_at,user_id, users_profiles:users_profiles!user_stories_user_id_fkey(id,full_name,username,avatar_url)')
      .in('status', ['approved', 'featured'])
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    const res = NextResponse.json({ success: true, data })
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


