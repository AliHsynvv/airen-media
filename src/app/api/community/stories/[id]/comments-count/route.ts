import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const parts = url.pathname.split('/').filter(Boolean)
    // Expecting .../community/stories/[id]/comments-count
    const storiesIdx = parts.findIndex(p => p === 'stories')
    const storyId = storiesIdx >= 0 ? parts[storiesIdx + 1] : ''
    if (!storyId) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    const { count, error } = await supabaseAdmin
      .from('community_story_comments')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', storyId)
    if (error) throw error
    return NextResponse.json({ success: true, count: count || 0 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}



