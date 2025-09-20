import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export async function GET(req: NextRequest) {
  try {
    const storyId = req.nextUrl.searchParams.get('storyId')
    if (!storyId) return NextResponse.json({ success: false, error: 'storyId required' }, { status: 400 })
    const { count, error } = await supabaseAdmin
      .from('story_likes')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', storyId)
    if (error) throw error
    return NextResponse.json({ success: true, data: { count: count || 0 } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const storyId = body?.storyId as string | undefined
    if (!storyId) return NextResponse.json({ success: false, error: 'storyId required' }, { status: 400 })

    const sb = await getServerSupabase()
    const { data: u } = await sb.auth.getUser()
    const userId = u.user?.id
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabaseAdmin
      .from('story_likes')
      .insert({ story_id: storyId, user_id: userId })
    if (error && error.code !== '23505') throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const storyId = body?.storyId as string | undefined
    if (!storyId) return NextResponse.json({ success: false, error: 'storyId required' }, { status: 400 })

    const sb = await getServerSupabase()
    const { data: u } = await sb.auth.getUser()
    const userId = u.user?.id
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabaseAdmin
      .from('story_likes')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', userId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


