import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('id,title,slug,excerpt,featured_image,image_alt,category_id,view_count,reading_time,published_at,featured,type, article_tags:article_tags(tags(id,name,slug,color)), article_likes(count), article_comments(count)')
      .eq('type', 'news')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(100)
    if (error) throw error
    const res = NextResponse.json({ success: true, data })
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


