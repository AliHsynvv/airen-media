import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const storyId = params.id
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



