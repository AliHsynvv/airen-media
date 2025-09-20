import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const commentId = body?.commentId as string | undefined
    if (!commentId) return NextResponse.json({ success: false, error: 'commentId required' }, { status: 400 })

    const sb = await getServerSupabase()
    const { data: u } = await sb.auth.getUser()
    const userId = u.user?.id
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabaseAdmin
      .from('article_comment_likes')
      .insert({ comment_id: commentId, user_id: userId })
    if (error && error.code !== '23505') throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const commentId = body?.commentId as string | undefined
    if (!commentId) return NextResponse.json({ success: false, error: 'commentId required' }, { status: 400 })

    const sb = await getServerSupabase()
    const { data: u } = await sb.auth.getUser()
    const userId = u.user?.id
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabaseAdmin
      .from('article_comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


