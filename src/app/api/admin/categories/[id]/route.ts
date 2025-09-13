import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

async function requireAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return { ok: false as const, status: 401, error: 'unauthorized' }
  const { data: u, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !u?.user) return { ok: false as const, status: 401, error: 'invalid token' }
  const { data: profile } = await supabaseAdmin
    .from('users_profiles')
    .select('role')
    .eq('id', u.user.id)
    .maybeSingle()
  if ((profile as any)?.role !== 'admin') return { ok: false as const, status: 403, error: 'forbidden' }
  return { ok: true as const, userId: u.user.id }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req)
  if (!admin.ok) return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
  const { id } = await context.params
  const body = await req.json()
  const payload = {
    name: body.name,
    slug: body.slug,
    description: body.description ?? null,
    color: body.color ?? null,
    icon: body.icon ?? null,
    sort_order: Number(body.sort_order || 0),
    is_active: Boolean(body.is_active ?? true),
  }
  const { error } = await supabaseAdmin.from('categories').update(payload).eq('id', id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req)
  if (!admin.ok) return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
  const { id } = await context.params
  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}


