import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

// GET: List bookings (for business owner or user's own bookings)
export async function GET(req: NextRequest) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get('business_id')
  const serviceId = searchParams.get('service_id')

  let query = supabase
    .from('business_service_bookings')
    .select('*, business_services!inner(name), users_profiles!inner(full_name, username, avatar_url)')
    .order('created_at', { ascending: false })

  // Check if user is business owner
  if (businessId) {
    const { data: business } = await supabase
      .from('business_profiles')
      .select('owner_id')
      .eq('id', businessId)
      .single()

    if (business && business.owner_id === user.id) {
      query = query.eq('business_id', businessId)
    } else {
      // Not business owner, show only user's own bookings
      query = query.eq('user_id', user.id)
    }
  } else {
    // Show only user's own bookings
    query = query.eq('user_id', user.id)
  }

  if (serviceId) {
    query = query.eq('service_id', serviceId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookings: data || [] })
}

// POST: Create a new booking
export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const {
    service_id,
    start_date,
    end_date,
    guests_count = 1,
    customer_name,
    customer_email,
    customer_phone,
    special_requests
  } = body

  // Validate required fields
  if (!service_id || !start_date || !customer_name || !customer_email || !customer_phone) {
    return NextResponse.json({ 
      error: 'Missing required fields' 
    }, { status: 400 })
  }

  // Get service details
  const { data: service, error: serviceError } = await supabase
    .from('business_services')
    .select('*, business_profiles!inner(id)')
    .eq('id', service_id)
    .single()

  if (serviceError || !service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  if (!service.is_available || !service.is_bookable) {
    return NextResponse.json({ error: 'Service not available for booking' }, { status: 400 })
  }

  const businessProfile: any = Array.isArray(service.business_profiles)
    ? service.business_profiles[0]
    : service.business_profiles

  // Calculate total price
  const pricePerUnit = service.discounted_price || service.price
  let totalPrice = pricePerUnit

  if (end_date) {
    const days = Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24))
    totalPrice = pricePerUnit * Math.max(days, service.min_booking_days)
  }

  totalPrice *= guests_count

  // Create booking
  const { data: booking, error } = await supabase
    .from('business_service_bookings')
    .insert({
      service_id,
      business_id: businessProfile.id,
      user_id: user.id,
      start_date,
      end_date: end_date || null,
      guests_count,
      price_per_unit: pricePerUnit,
      total_price: totalPrice,
      currency: service.currency,
      status: 'pending',
      customer_name,
      customer_email,
      customer_phone,
      special_requests: special_requests || null
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ booking })
}

