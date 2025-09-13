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

export async function GET() {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('id,name,slug,description,color,icon,sort_order,is_active')
    .order('sort_order', { ascending: true })
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin.ok) return NextResponse.json({ success: false, error: admin.error }, { status: admin.status })
  const body = await req.json()
  const payload = {
    name: String(body.name || ''),
    slug: String(body.slug || ''),
    description: body.description ?? null,
    color: body.color ?? null,
    icon: body.icon ?? null,
    sort_order: Number(body.sort_order || 0),
    is_active: Boolean(body.is_active ?? true),
  }
  if (!payload.name || !payload.slug) return NextResponse.json({ success: false, error: 'name/slug required' }, { status: 400 })
  const { error } = await supabaseAdmin.from('categories').insert(payload)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}


