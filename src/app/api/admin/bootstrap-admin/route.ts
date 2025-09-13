import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
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

    const { email, password, username, full_name } = parsed.data

    // Create auth user (email confirmed)
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, full_name },
    })
    if (createErr || !created.user) {
      throw new Error(createErr?.message || 'Failed to create auth user')
    }
    const userId = created.user.id

    // Create profile with admin role
    const { error: profileErr } = await supabaseAdmin
      .from('users_profiles')
      .insert({
        id: userId,
        username,
        full_name: full_name ?? null,
        role: 'admin',
        status: 'active',
        email_verified: true,
      })
    if (profileErr) throw new Error(profileErr.message)

    return NextResponse.json({ success: true, data: { id: userId } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function GET() {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bootstrap Admin</title>
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;padding:24px;background:#0a0a0a;color:#fff}code{background:#111;padding:2px 6px;border-radius:4px}</style>
  </head>
  <body>
    <h1>Bootstrap Admin Endpoint</h1>
    <p>This endpoint accepts <code>POST</code> with JSON:</p>
    <pre>{"email":"admin@example.com","password":"StrongPass123!","username":"admin","full_name":"Admin"}</pre>
    <p>Or use the setup page at <a href="/admin/setup">/admin/setup</a>.</p>
  </body>
</html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}


