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
  average_budget: {
    daily?: number
    weekly?: number
  }
  budget_level?: 'Budget' | 'Mid-range' | 'Luxury' | string | null
  
  // AI Content
  airen_advice: string | null
  airen_video_url: string | null
  airen_audio_url: string | null
  
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
