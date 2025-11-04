export interface BusinessProfile {
  id: string
  owner_id: string
  name: string
  category: string | null
  description: string | null
  website: string | null
  email: string | null
  phone: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  profile_image_url: string | null
  cover_image_url: string | null
  social_instagram: string | null
  social_tiktok: string | null
  social_facebook: string | null
  social_youtube: string | null
  services: string[] | null
  average_rating: number | null
  total_reviews: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BusinessMedia {
  id: string
  business_id: string
  storage_path: string
  url: string
  media_type: 'image' | 'video'
  title: string | null
  description: string | null
  position: number
  created_by: string
  created_at: string
}

export interface BusinessReview {
  id: string
  business_id: string
  user_id: string
  rating: number
  comment: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  owner_reply: string | null
  owner_reply_at: string | null
}

export interface BusinessPost {
  id: string
  business_id: string
  title: string
  content: string | null
  scheduled_at: string | null
  published_at: string | null
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  created_by: string
  created_at: string
  updated_at: string
}

export type BusinessServiceCategory = 
  | 'rentecar' 
  | 'turizm' 
  | 'hotel' 
  | 'apartment' 
  | 'restoran' 
  | 'xestexana' 
  | 'sigorta' 
  | 'aviacompany' 
  | 'attraction' 
  | 'guides'

// Category-specific data types
export interface RentecarData {
  vehicle_type: 'sedan' | 'suv' | 'luxury' | 'minivan' | 'other'
  brand: string
  model: string
  year: number
  seats: number
  transmission: 'automatic' | 'manual'
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  features: string[]
}

export interface HotelApartmentData {
  room_type: 'single' | 'double' | 'suite' | 'apartment'
  beds: number
  bathrooms: number
  size_sqm: number
  floor?: number
  view?: 'sea' | 'city' | 'mountain' | 'garden'
  amenities: string[]
}

export interface RestoranData {
  cuisine_type: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'all'
  serves: number
  spicy_level?: number
  dietary: string[]
}

export interface TurizmData {
  tour_type: 'city' | 'nature' | 'adventure' | 'cultural' | 'other'
  duration_hours: number
  includes: string[]
  difficulty: 'easy' | 'moderate' | 'hard'
  languages: string[]
}

export interface XestexanaData {
  treatment_type: string
  duration_days: number
  doctor_specialty?: string
  includes: string[]
}

export interface SigortaData {
  insurance_type: 'travel' | 'health' | 'vehicle' | 'property'
  coverage_amount: number
  duration_days: number
  covers: string[]
}

export interface AviaCompanyData {
  flight_type: 'domestic' | 'international'
  class: 'economy' | 'business' | 'first'
  baggage_kg: number
  route: string
  duration_hours: number
}

export interface AttractionData {
  attraction_type: 'museum' | 'park' | 'monument' | 'entertainment' | 'other'
  duration_hours: number
  age_restriction: string
  includes: string[]
}

export interface GuidesData {
  guide_type: 'tour' | 'translator' | 'driver'
  languages: string[]
  experience_years: number
  specialization: string
  available_days: string[]
}

export type CategoryData = 
  | RentecarData 
  | HotelApartmentData 
  | RestoranData 
  | TurizmData 
  | XestexanaData 
  | SigortaData 
  | AviaCompanyData 
  | AttractionData 
  | GuidesData

export interface BusinessService {
  id: string
  business_id: string
  name: string
  description: string | null
  category: BusinessServiceCategory
  price: number
  currency: string
  discount_percentage: number
  discounted_price?: number
  is_bookable: boolean
  is_available: boolean
  max_capacity: number | null
  min_booking_days: number
  image_urls: string[]
  category_data: CategoryData | Record<string, any>
  created_by: string
  created_at: string
  updated_at: string
}

export interface BusinessServiceBooking {
  id: string
  service_id: string
  business_id: string
  user_id: string
  start_date: string
  end_date: string | null
  guests_count: number
  price_per_unit: number
  total_price: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  customer_name: string
  customer_email: string
  customer_phone: string
  special_requests: string | null
  created_at: string
  updated_at: string
  confirmed_at: string | null
  cancelled_at: string | null
}

