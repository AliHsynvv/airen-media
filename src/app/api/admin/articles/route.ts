import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'
import slugify from 'slugify'

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(20),
  excerpt: z.string().optional(),
  featured_image: z.string().url().optional(),
  image_alt: z.string().optional(),
  category_id: z.string().uuid().optional(),
  type: z.enum(['article', 'news', 'guide']).default('news'),
  featured: z.boolean().optional(),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  tag_names: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: 'Supabase env vars missing' }, { status: 500 })
    }
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 })
    }

    // TODO: Add auth/role guard when auth is integrated
    const payload = parsed.data
    const authorId = process.env.ADMIN_AUTHOR_ID
    if (!authorId) {
      return NextResponse.json({ success: false, error: 'ADMIN_AUTHOR_ID missing' }, { status: 500 })
    }

    const baseSlug = slugify(payload.title, { lower: true, strict: true })
    let attempt = 0
    let lastError: any = null
    let createdArticle: any = null
    while (attempt < 3) {
      const slugCandidate = attempt === 0 ? baseSlug : `${baseSlug}-${Math.floor(Math.random() * 1000)}`
      const { data, error } = await supabaseAdmin
        .from('articles')
        .insert({
          title: payload.title,
          slug: slugCandidate,
          content: payload.content,
          excerpt: payload.excerpt ?? null,
          featured_image: payload.featured_image ?? null,
          image_alt: payload.image_alt ?? null,
          category_id: payload.category_id ?? null,
          author_id: authorId,
          status: 'published',
          type: payload.type,
          featured: payload.featured ?? false,
          meta_title: payload.meta_title ?? null,
          meta_description: payload.meta_description ?? null,
          published_at: new Date().toISOString(),
        })
        .select('*')
        .single()
      if (!error) {
        createdArticle = data
        break
      }
      lastError = error
      attempt += 1
    }
    if (!createdArticle) throw lastError

    // Handle tags if provided
    const tagNames = (payload.tag_names || []).map(n => n.trim()).filter(n => n.length)
    if (tagNames.length) {
      const tagRows = tagNames.map(name => ({ name, slug: slugify(name, { lower: true, strict: true }) }))
      const { error: tagErr } = await supabaseAdmin
        .from('tags')
        .upsert(tagRows, { onConflict: 'slug' })
      if (tagErr) throw tagErr
      const slugs = tagRows.map(t => t.slug)
      const { data: tagsData, error: tagsSelErr } = await supabaseAdmin
        .from('tags')
        .select('id,slug')
        .in('slug', slugs)
      if (tagsSelErr) throw tagsSelErr
      const pairs = (tagsData || []).map(t => ({ article_id: createdArticle.id, tag_id: t.id }))
      if (pairs.length) {
        const { error: atErr } = await supabaseAdmin
          .from('article_tags')
          .insert(pairs, { ignoreDuplicates: true })
        if (atErr) throw atErr
      }
    }

    return NextResponse.json({ success: true, data: createdArticle })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


