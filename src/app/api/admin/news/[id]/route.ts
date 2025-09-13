import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import slugify from 'slugify'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { data, error } = await supabaseAdmin.from('articles').select('*').eq('id', id).single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const payload = await req.json()
    const update: any = {
      title: payload.title,
      content: payload.content,
      excerpt: payload.excerpt ?? null,
      featured_image: payload.featured_image ?? null,
      image_alt: payload.image_alt ?? null,
      meta_title: payload.meta_title ?? null,
      meta_description: payload.meta_description ?? null,
    }
    if (payload.title) {
      update.slug = slugify(payload.title, { lower: true, strict: true })
    }
    const { data, error } = await supabaseAdmin.from('articles').update(update).eq('id', id).select('*').single()
    if (error) throw error
    const tagNames: string[] = (payload.tag_names || []).map((n: string) => n.trim()).filter(Boolean)
    if (tagNames.length) {
      const tagRows = tagNames.map(name => ({ name, slug: slugify(name, { lower: true, strict: true }) }))
      const { error: tagErr } = await supabaseAdmin.from('tags').upsert(tagRows, { onConflict: 'slug' })
      if (tagErr) throw tagErr
      const slugs = tagRows.map(t => t.slug)
      const { data: tagsData, error: tagsSelErr } = await supabaseAdmin.from('tags').select('id,slug').in('slug', slugs)
      if (tagsSelErr) throw tagsSelErr
      await supabaseAdmin.from('article_tags').delete().eq('article_id', id)
      const pairs = (tagsData || []).map(t => ({ article_id: id, tag_id: t.id }))
      if (pairs.length) {
        const { error: atErr } = await supabaseAdmin.from('article_tags').insert(pairs)
        if (atErr) throw atErr
      }
    }
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { error } = await supabaseAdmin.from('articles').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}