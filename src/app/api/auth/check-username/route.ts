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
    const { data, error } = await supabaseAdmin
      .from('users_profiles')
      .select('id')
      .eq('username', username)
      .limit(1)
    if (error) throw error
    const exists = !!(data && data.length)
    return NextResponse.json({ success: true, exists })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'unexpected_error' }, { status: 500 })
  }
}


