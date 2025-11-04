import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'
import type { BusinessServiceCategory } from '@/types/business'

// GET: List all services for a business
export async function GET(req: NextRequest) {
  const supabase = await getServerSupabase()
  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get('business_id')
  const category = searchParams.get('category') as BusinessServiceCategory | null
  
  if (!businessId) {
    return NextResponse.json({ error: 'business_id required' }, { status: 400 })
  }

  let query = supabase
    .from('business_services')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ services: data || [] })
}

// POST: Create a new service
export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const {
    business_id,
    name,
    description,
    category,
    price,
    currency = 'AZN',
    discount_percentage = 0,
    is_bookable = true,
    is_available = true,
    max_capacity,
    min_booking_days = 1,
    image_urls = [],
    category_data = {}
  } = body

  // Validate required fields
  if (!business_id || !name || !category || price === undefined) {
    return NextResponse.json({ 
      error: 'Missing required fields: business_id, name, category, price' 
    }, { status: 400 })
  }

  // Verify ownership
  const { data: business } = await supabase
    .from('business_profiles')
    .select('id, owner_id')
    .eq('id', business_id)
    .single()

  if (!business || business.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Create service
  const { data: service, error } = await supabase
    .from('business_services')
    .insert({
      business_id,
      name,
      description,
      category,
      price,
      currency,
      discount_percentage,
      is_bookable,
      is_available,
      max_capacity,
      min_booking_days,
      image_urls,
      category_data,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ service })
}

