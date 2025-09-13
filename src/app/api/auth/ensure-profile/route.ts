import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'

const schema = z.object({
  user_id: z.string().uuid(),
  username: z.string().min(3),
  full_name: z.string().optional(),
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

    const { user_id, username, full_name } = parsed.data
    const { data, error } = await supabaseAdmin
      .from('users_profiles')
      .upsert({
        id: user_id,
        username,
        full_name: full_name ?? null,
        role: 'user',
        status: 'active',
        email_verified: false,
      }, { onConflict: 'id' })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}


