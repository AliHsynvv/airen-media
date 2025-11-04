import { BaseEntity } from './global'

export interface Country extends BaseEntity {
  name: string
  slug: string
  flag_icon: string | null
  iso_code: string | null
  
  // Basic Info
  capital: string | null
  population: number | null
  official_language: string | null
  currency: string | null
  currency_code: string | null
  timezone: string | null
  
  // Map Data
  latitude: number | null
  longitude: number | null
  
  // Travel Info
  visa_info: string | null
  entry_requirements: string | null
  visa_required?: boolean | null
  best_time_to_visit: string | null
  climate_info: string | null
  
  // Cultural Info
  culture_description: string | null
  historical_info: string | null
  food_description: string | null
  local_customs: string | null
  
  // Tourism Data
  top_places: TopPlace[]
  popular_activities: string[]
  popular_cities?: string[]
  negatives?: string[]
  popular_restaurants?: Venue[]
  popular_hotels?: Venue[]
  average_budget: {
    daily?: number
    weekly?: number
  }
  budget_level?: 'Budget' | 'Mid-range' | 'Luxury' | string | null
  
  // Negative Aspects
  negative_aspects: NegativeAspect[]
  
  // Famous Foods
  famous_foods: FamousFood[]
  
  // Restaurants & Hotels
  restaurants: Restaurant[]
  hotels: Hotel[]
  
  // AI Content
  airen_advice: string | null
  airen_video_url: string | null
  airen_audio_url: string | null
  // i18n JSON fields
  culture_description_i18n?: Record<string, string | null> | null
  visa_info_i18n?: Record<string, string | null> | null
  entry_requirements_i18n?: Record<string, string | null> | null
  airen_advice_i18n?: Record<string, string | null> | null
  best_time_to_visit_i18n?: Record<string, string | null> | null
  climate_info_i18n?: Record<string, string | null> | null
  historical_info_i18n?: Record<string, string | null> | null
  food_description_i18n?: Record<string, string | null> | null
  local_customs_i18n?: Record<string, string | null> | null
  
  // SEO
  meta_title: string | null
  meta_description: string | null
  featured_image: string | null
  visitors_per_year?: number | null
  featured?: boolean | null
  trending_score?: number | null
  
  // Stats
  view_count: number
  article_count: number
  
  status: 'active' | 'inactive'
}

export interface TopPlace {
  name: string
  description: string
  image?: string
  location?: {
    lat: number
    lng: number
  }
}

export interface NegativeAspect {
  title: string
  description: string
  severity?: 'low' | 'medium' | 'high'
  category?: 'cost' | 'safety' | 'weather' | 'infrastructure' | 'other'
}

export interface FamousFood {
  name: string
  local_name?: string
  description: string
  image_url?: string
  price_range?: string
  ingredients?: string[]
  recommended_places?: string[]
  is_vegetarian?: boolean
  is_vegan?: boolean
}

export interface Restaurant {
  name: string
  description: string
  address?: string
  latitude?: number
  longitude?: number
  rating?: number
  price_range?: '$' | '$$' | '$$$' | '$$$$'
  cuisine_type?: string
  specialties?: string[]
  images?: string[]
  phone?: string
  website?: string
  opening_hours?: string
  average_meal_cost?: number
}

export interface Hotel {
  name: string
  description: string
  address?: string
  latitude?: number
  longitude?: number
  rating?: number
  star_rating?: number
  price_range?: '$' | '$$' | '$$$' | '$$$$'
  price_per_night?: number
  images?: string[]
  amenities?: string[]
  phone?: string
  website?: string
  booking_url?: string
  room_types?: string[]
}

export interface Venue {
  name: string
  image?: string
  url?: string
  description?: string
  location?: {
    lat?: number
    lng?: number
    address?: string
    city?: string
  }
  rating?: number
}

export interface CreateCountryData {
  name: string
  slug?: string
  flag_icon?: string
  iso_code?: string
  capital?: string
  population?: number
  official_language?: string
  currency?: string
  currency_code?: string
  timezone?: string
  visa_info?: string
  entry_requirements?: string
  best_time_to_visit?: string
  climate_info?: string
  culture_description?: string
  historical_info?: string
  food_description?: string
  local_customs?: string
  top_places?: TopPlace[]
  popular_activities?: string[]
  negatives?: string[]
  latitude?: number | null
  longitude?: number | null
  popular_restaurants?: Venue[]
  popular_hotels?: Venue[]
  average_budget?: {
    daily?: number
    weekly?: number
  }
  airen_advice?: string
  airen_video_url?: string
  airen_audio_url?: string
  meta_title?: string
  meta_description?: string
  featured_image?: string
}
