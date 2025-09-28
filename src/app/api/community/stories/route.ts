import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_stories')
      .select([
        // Core fields used on cards and filters
        'id',
        'slug',
        'title',
        'content',
        'image_url',
        'image_alt',
        'category',
        'tags',
        'status',
        'created_at',
        'user_id',
        // Author header
        'users_profiles:users_profiles!user_stories_user_id_fkey(id,full_name,username,avatar_url)',
        // Aggregates used by actions bar
        'community_story_comments(count)'
      ].join(','))
      .in('status', ['approved', 'featured'])
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    const res = NextResponse.json({ success: true, data })
    res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600')
    return res
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


