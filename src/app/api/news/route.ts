import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const pageParam = url.searchParams.get('page')
    const limitParam = url.searchParams.get('limit')
    const page = Math.max(1, Math.min(1000, Number(pageParam) || 1))
    const limit = Math.max(1, Math.min(50, Number(limitParam) || 12))
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabaseAdmin
      .from('articles')
      .select(
        [
          // Core fields used by list UI and filters
          'id',
          'title',
          'slug',
          'excerpt',
          'featured_image',
          'image_alt',
          'category_id',
          'view_count',
          'published_at',
          'reading_time',
          'featured',
          'type',
          // Translation fields
          'translations',
          'default_language',
          // Tags displayed as chips
          'article_tags:article_tags(tags(id,name,slug))',
          // Aggregate counts displayed in cards
          'article_likes(count)',
          'article_comments(count)'
        ].join(','),
        { count: 'exact' }
      )
      .eq('type', 'news')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    const res = NextResponse.json({ success: true, data: data || [], page, limit, total: count || 0 })
    res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600')
    return res
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


