import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: 'Supabase env vars missing' }, { status: 500 })
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    const folder = (form.get('folder') as string | null) || ''
    const bucket = (form.get('bucket') as string | null) || process.env.NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET || 'Articles'
    if (!file) return NextResponse.json({ success: false, error: 'file is required' }, { status: 400 })

    const filename = file.name?.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'upload.bin'
    const prefix = folder ? `${folder}/` : ''
    const path = `${prefix}${Date.now()}_${filename}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadErr } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, Buffer.from(arrayBuffer), { contentType: file.type, upsert: false })
    if (uploadErr) throw uploadErr

    const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
    return NextResponse.json({ success: true, data: { path, url: pub.publicUrl } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


