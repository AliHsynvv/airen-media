import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json()
    const allowed = ['pending','approved','rejected','featured']
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ success: false, error: 'invalid status' }, { status: 400 })
    }
    const { id } = await context.params
    const { data, error } = await supabaseAdmin
      .from('user_stories')
      .update({ status: body.status })
      .eq('id', id)
      .select('id,status')
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}



