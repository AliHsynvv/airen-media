import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'

const schema = z.object({
  email: z.string().email().transform(v => v.toLowerCase().trim()),
})

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: 'Supabase env vars missing' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'invalid_email' }, { status: 400 })
    }

    const email = parsed.data.email
    try {
      const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email)
      if (error && (error as any).status !== 404 && !(error.message || '').includes('User not found')) {
        throw error
      }
      const exists = !!data?.user && (data.user.email || '').toLowerCase() === email
      return NextResponse.json({ success: true, exists })
    } catch (sdkErr: any) {
      // Fallback to direct Admin REST call (more tolerant across environments)
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
      const res = await fetch(`${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({} as any))
        return NextResponse.json({ success: false, error: errJson?.error || `admin_rest_${res.status}` }, { status: 500 })
      }
      const json: any = await res.json()
      const users = Array.isArray(json?.users) ? json.users : Array.isArray(json) ? json : []
      const exists = users.some((u: any) => (u?.email || '').toLowerCase() === email)
      return NextResponse.json({ success: true, exists })
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'unexpected_error' }, { status: 500 })
  }
}


