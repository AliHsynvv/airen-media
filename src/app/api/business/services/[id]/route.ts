import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

type Params = { params: Promise<{ id: string }> }

// GET: Get single service
export async function GET(req: NextRequest, context: Params) {
  const supabase = await getServerSupabase()
  const { id } = await context.params

  const { data, error } = await supabase
    .from('business_services')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  return NextResponse.json({ service: data })
}

// PATCH: Update service
export async function PATCH(req: NextRequest, context: Params) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await req.json().catch(() => ({}))

  // Verify ownership
  const { data: service } = await supabase
    .from('business_services')
    .select('business_id, business_profiles!inner(owner_id)')
    .eq('id', id)
    .single()

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const businessProfile: any = Array.isArray(service.business_profiles) 
    ? service.business_profiles[0] 
    : service.business_profiles

  if (businessProfile?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update service
  const updateData: any = {}
  if (body.name !== undefined) updateData.name = body.name
  if (body.description !== undefined) updateData.description = body.description
  if (body.price !== undefined) updateData.price = body.price
  if (body.currency !== undefined) updateData.currency = body.currency
  if (body.discount_percentage !== undefined) updateData.discount_percentage = body.discount_percentage
  if (body.is_bookable !== undefined) updateData.is_bookable = body.is_bookable
  if (body.is_available !== undefined) updateData.is_available = body.is_available
  if (body.max_capacity !== undefined) updateData.max_capacity = body.max_capacity
  if (body.min_booking_days !== undefined) updateData.min_booking_days = body.min_booking_days
  if (body.image_urls !== undefined) updateData.image_urls = body.image_urls
  if (body.category_data !== undefined) updateData.category_data = body.category_data

  const { data, error } = await supabase
    .from('business_services')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ service: data })
}

// DELETE: Delete service
export async function DELETE(req: NextRequest, context: Params) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  // Verify ownership
  const { data: service } = await supabase
    .from('business_services')
    .select('business_id, business_profiles!inner(owner_id)')
    .eq('id', id)
    .single()

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const businessProfile: any = Array.isArray(service.business_profiles) 
    ? service.business_profiles[0] 
    : service.business_profiles

  if (businessProfile?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete service
  const { error } = await supabase
    .from('business_services')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

