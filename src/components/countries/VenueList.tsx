'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Globe, Utensils, Hotel, ChevronDown, ChevronUp, Star, Phone, Clock } from 'lucide-react'

interface Venue {
  name: string
  image?: string
  url?: string
  description?: string
  location?: {
    address?: string
    city?: string
    lat?: number
    lng?: number
    vicinity?: string
  }
  rating?: number
  user_ratings_total?: number
  price_level?: number
  phone?: string
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  business_status?: string
}

interface VenueListProps {
  venues: Venue[]
  type: 'restaurants' | 'hotels'
  initialDisplay?: number
  countrySlug?: string // Optional: for "View All" link to dedicated page
}

// Helper to format numbers consistently (avoid hydration mismatch)
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function VenueList({ venues, type, initialDisplay = 6, countrySlug }: VenueListProps) {
  const [showAll, setShowAll] = useState(false)
  
  const displayedVenues = showAll ? venues : venues.slice(0, initialDisplay)
  const hasMore = venues.length > initialDisplay
  const viewAllLink = countrySlug ? `/countries/${countrySlug}/${type}` : null
  
  const Icon = type === 'restaurants' ? Utensils : Hotel
  const colorClass = type === 'restaurants' ? 'red' : 'teal'
  const bgGradient = type === 'restaurants' 
    ? 'from-white to-red-50/30' 
    : 'from-white to-teal-50/30'
  const hoverBorder = type === 'restaurants' 
    ? 'hover:border-red-300' 
    : 'hover:border-teal-300'
  const textColor = type === 'restaurants' 
    ? 'text-red-600 hover:text-red-700' 
    : 'text-teal-600 hover:text-teal-700'

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedVenues.map((v: Venue, index: number) => (
          <div 
            key={`${v.name}-${index}`} 
            className={`group rounded-xl border border-gray-200 hover:shadow-lg ${hoverBorder} transition-all bg-gradient-to-br ${bgGradient} overflow-hidden`}
          >
            {/* Image Section - Full Width */}
            <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200">
              {v.image ? (
                <Image 
                  src={v.image} 
                  alt={v.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-300" 
                  sizes="(max-width: 640px) 100vw, 50vw" 
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Icon className="h-16 w-16 text-gray-400" />
                </div>
              )}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              
              {/* Rating Badge - Top Right */}
              {v.rating && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-black text-sm font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  {v.rating.toFixed(1)}
                </div>
              )}
              
              {/* Price Level Badge - Top Left */}
              {v.price_level && (
                <div className="absolute top-3 left-3 bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {'$'.repeat(v.price_level)}
                </div>
              )}
              
              {/* Open/Closed Badge - Bottom Right */}
              {v.opening_hours?.open_now !== undefined && (
                <div className={`absolute bottom-3 right-3 ${v.opening_hours.open_now ? 'bg-green-600' : 'bg-red-600'} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
                  <Clock className="h-3.5 w-3.5" />
                  {v.opening_hours.open_now ? 'Open Now' : 'Closed'}
                </div>
              )}
            </div>
            
            {/* Content Section */}
            <div className="p-4 space-y-3">
              <div className="font-bold text-lg text-gray-900 line-clamp-1">{v.name}</div>
              
              {/* Rating & Reviews Row */}
              {(v.rating || v.user_ratings_total) && (
                <div className="flex items-center gap-3 text-sm">
                  {v.rating && (
                    <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                      <Star className="h-4 w-4 fill-current" />
                      {v.rating.toFixed(1)}
                    </div>
                  )}
                  {v.user_ratings_total && (
                    <div className="text-gray-600">
                      ({formatNumber(v.user_ratings_total)} reviews)
                    </div>
                  )}
                </div>
              )}
              
              {v.description && (
                <div className="text-sm text-gray-600 line-clamp-2">{v.description}</div>
              )}
              
              {/* Contact Info */}
              <div className="space-y-1.5">
                {v.location?.address && (
                  <div className="flex items-start gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{v.location.address}</span>
                  </div>
                )}
                {v.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <a href={`tel:${v.phone}`} className="hover:text-blue-600 transition-colors">
                      {v.phone}
                    </a>
                  </div>
                )}
              </div>
              
              {v.url && (
                <a 
                  href={v.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`flex items-center gap-2 text-sm ${textColor} font-medium group/link mt-3`}
                >
                  <Globe className="h-4 w-4" />
                  <span className="group-hover/link:underline">Visit Website</span>
                  <svg className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* View All / Show Less Button */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          {viewAllLink && !showAll ? (
            // Link to dedicated page (if countrySlug provided)
            <Link
              href={viewAllLink}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg ${
                type === 'restaurants' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                  : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
              }`}
            >
              <ChevronDown className="h-5 w-5" />
              View All {type === 'restaurants' ? 'Restaurants' : 'Hotels'} ({venues.length})
            </Link>
          ) : (
            // Inline expand/collapse (fallback)
            <button
              onClick={() => setShowAll(!showAll)}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg ${
                type === 'restaurants' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                  : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
              }`}
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-5 w-5" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5" />
                  View All ({venues.length} {type === 'restaurants' ? 'restaurants' : 'hotels'})
                </>
              )}
            </button>
          )}
        </div>
      )}
    </>
  )
}

