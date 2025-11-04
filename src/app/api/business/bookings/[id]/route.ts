import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

type Params = { params: Promise<{ id: string }> }

// PATCH: Update booking status (business owner only)
export async function PATCH(req: NextRequest, context: Params) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await req.json().catch(() => ({}))

  // Get booking with business info
  const { data: booking, error: fetchError } = await supabase
    .from('business_service_bookings')
    .select('*, business_profiles!inner(owner_id)')
    .eq('id', id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const businessProfile: any = Array.isArray(booking.business_profiles)
    ? booking.business_profiles[0]
    : booking.business_profiles

  // Only business owner can update booking
  if (businessProfile.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update booking
  const updateData: any = {}
  
  if (body.status) {
    updateData.status = body.status
    if (body.status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    } else if (body.status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from('business_service_bookings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ booking: data })
}

// DELETE: Cancel booking (user or business owner)
export async function DELETE(req: NextRequest, context: Params) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  // Get booking
  const { data: booking, error: fetchError } = await supabase
    .from('business_service_bookings')
    .select('*, business_profiles!inner(owner_id)')
    .eq('id', id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const businessProfile: any = Array.isArray(booking.business_profiles)
    ? booking.business_profiles[0]
    : booking.business_profiles

  // Only user who made booking or business owner can cancel
  if (booking.user_id !== user.id && businessProfile.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update status to cancelled instead of deleting
  const { error } = await supabase
    .from('business_service_bookings')
    .update({ 
      status: 'cancelled', 
      cancelled_at: new Date().toISOString() 
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

