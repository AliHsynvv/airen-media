import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'

const schema = z.object({
  username: z.string().min(3).max(32).transform(v => v.toLowerCase().trim()),
})

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: 'Supabase env vars missing' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'invalid_username' }, { status: 400 })
    }
    const username = parsed.data.username
    try {
      const { count, error } = await supabaseAdmin
        .from('users_profiles')
        .select('id', { count: 'exact', head: true })
        .ilike('username', username)
        .limit(1)
      if (error) throw error
      const exists = (count || 0) > 0
      return NextResponse.json({ success: true, exists })
    } catch (sdkErr: any) {
      // Fallback to PostgREST direct request for resilient counting
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
      const restUrl = `${url}/rest/v1/users_profiles?username=ilike.${encodeURIComponent(username)}&select=id`
      const res = await fetch(restUrl, {
        method: 'GET',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: 'count=exact,head=true',
        },
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        return NextResponse.json({ success: false, error: errText || `rest_${res.status}` }, { status: 500 })
      }
      const range = res.headers.get('content-range') || ''
      // Content-Range: 0-0/1 -> extract total after '/'
      const total = Number((range.split('/')?.[1] || '').trim())
      const exists = Number.isFinite(total) && total > 0
      return NextResponse.json({ success: true, exists })
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'unexpected_error' }, { status: 500 })
  }
}


