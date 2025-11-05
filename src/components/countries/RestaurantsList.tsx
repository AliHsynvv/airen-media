'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { MapPin, Star, Phone, Globe, Clock, Utensils, Search, SlidersHorizontal, ChevronDown } from 'lucide-react'

interface Restaurant {
  name: string
  place_id?: string
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

interface RestaurantsListProps {
  restaurants: Restaurant[]
}

// Helper to format numbers
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function RestaurantsList({ restaurants }: RestaurantsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'price' | 'name'>('rating')
  const [filterPrice, setFilterPrice] = useState<number | null>(null)
  const [filterOpenNow, setFilterOpenNow] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    let result = [...restaurants]

    // Search filter
    if (searchTerm) {
      result = result.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price filter
    if (filterPrice) {
      result = result.filter(r => r.price_level === filterPrice)
    }

    // Open now filter
    if (filterOpenNow) {
      result = result.filter(r => r.opening_hours?.open_now === true)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'reviews':
          return (b.user_ratings_total || 0) - (a.user_ratings_total || 0)
        case 'price':
          return (a.price_level || 0) - (b.price_level || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return result
  }, [restaurants, searchTerm, sortBy, filterPrice, filterOpenNow])

  return (
    <div className="space-y-8">
      {/* Modern Search & Filters Bar */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search - Minimal & Professional */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search by name, location, or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all text-gray-900 placeholder:text-gray-400 font-medium shadow-sm"
              />
            </div>

            {/* Sort By - Enhanced */}
            <div className="relative group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-5 py-3.5 pr-12 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 cursor-pointer font-semibold text-gray-700 hover:border-gray-300 transition-all shadow-sm min-w-[200px]"
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="reviews">💬 Most Reviewed</option>
                <option value="price">💰 Price: Low to High</option>
                <option value="name">🔤 A-Z</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" strokeWidth={2} />
            </div>

            {/* Filters Toggle - Minimal & Professional */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl border-2 font-bold transition-all shadow-sm hover:shadow-md ${
                showFilters || filterPrice || filterOpenNow
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-red-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
              <span>Filters</span>
              {(filterPrice || filterOpenNow) && (
                <span className="bg-white text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full min-w-[24px] text-center shadow-sm">
                  {(filterPrice ? 1 : 0) + (filterOpenNow ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters - Enhanced */}
          {showFilters && (
          <div className="mt-6 pt-6 border-t-2 border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Price Level Filter - Enhanced */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-red-500">💰</span>
                  Price Range
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(level => (
                    <button
                      key={level}
                      onClick={() => setFilterPrice(filterPrice === level ? null : level)}
                      className={`flex-1 py-3 px-3 rounded-xl border-2 transition-all font-bold text-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                        filterPrice === level
                          ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 text-red-600 shadow-red-200 scale-105'
                          : 'border-gray-300 bg-white hover:border-red-300 text-gray-600 hover:bg-red-50'
                      }`}
                    >
                      {'$'.repeat(level)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select your budget preference</p>
              </div>

              {/* Open Now Filter - Enhanced */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-green-500">🕐</span>
                  Availability
                </label>
                <button
                  onClick={() => setFilterOpenNow(!filterOpenNow)}
                  className={`w-full py-3 px-5 rounded-xl border-2 transition-all flex items-center justify-center gap-3 font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                    filterOpenNow
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 text-green-700 shadow-green-200'
                      : 'border-gray-300 bg-white hover:border-green-300 text-gray-600 hover:bg-green-50'
                  }`}
                >
                  <Clock className="h-5 w-5" strokeWidth={2} />
                  <span>{filterOpenNow ? '✓ Open Now Only' : 'Show All Hours'}</span>
                </button>
                <p className="text-xs text-gray-500 mt-2">Filter currently open venues</p>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Results Count - Minimal & Professional */}
      <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Utensils className="h-5 w-5 text-gray-400" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              Showing <span className="font-bold text-red-600 text-lg">{filteredAndSorted.length}</span> of{' '}
              <span className="font-bold text-gray-900">{restaurants.length}</span> restaurants
            </p>
            {(searchTerm || filterPrice || filterOpenNow) && (
              <p className="text-xs text-gray-500 mt-0.5">
                {searchTerm && `🔍 "${searchTerm}"`}
                {filterPrice && ` • 💰 ${'$'.repeat(filterPrice)}`}
                {filterOpenNow && ' • 🟢 Open Now'}
              </p>
            )}
          </div>
        </div>
        {(searchTerm || filterPrice || filterOpenNow) && (
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterPrice(null)
              setFilterOpenNow(false)
            }}
            className="text-sm text-red-600 hover:text-white font-bold px-4 py-2 rounded-lg border-2 border-red-200 hover:bg-red-600 hover:border-red-600 transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Restaurants Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Utensils className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Restaurants Found</h2>
          <p className="text-gray-600 mb-4">Try adjusting your filters or search term</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterPrice(null)
              setFilterOpenNow(false)
            }}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSorted.map((restaurant, index) => (
            <div 
              key={restaurant.place_id || index}
              className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-red-400 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              {/* Image - Enhanced */}
              <div className="relative h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {restaurant.image ? (
                  <Image 
                    src={restaurant.image} 
                    alt={restaurant.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                    <Utensils className="h-20 w-20 text-red-300" />
                  </div>
                )}
                
                {/* Overlay - Enhanced */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Badges - Minimal & Professional */}
                {restaurant.rating && (
                  <div className="absolute top-4 right-4 bg-gradient-to-br from-yellow-400 to-yellow-500 text-black text-base font-black px-4 py-2 rounded-xl shadow-2xl flex items-center gap-1.5 border-2 border-yellow-300">
                    <Star className="h-4 w-4 fill-current" strokeWidth={2} />
                    {restaurant.rating.toFixed(1)}
                  </div>
                )}
                
                {restaurant.price_level && (
                  <div className="absolute top-4 left-4 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-base font-black px-4 py-2 rounded-xl shadow-2xl border-2 border-emerald-400">
                    {'$'.repeat(restaurant.price_level)}
                  </div>
                )}
                
                {restaurant.opening_hours?.open_now !== undefined && (
                  <div className={`absolute bottom-4 right-4 ${restaurant.opening_hours.open_now ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400' : 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400'} text-white text-sm font-bold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border-2`}>
                    <Clock className="h-4 w-4" strokeWidth={2} />
                    {restaurant.opening_hours.open_now ? '✓ Open' : 'Closed'}
                  </div>
                )}
              </div>

              {/* Content - Enhanced */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-black text-xl text-gray-900 line-clamp-1 mb-1 group-hover:text-red-600 transition-colors">
                    {restaurant.name}
                  </h3>
                  
                  {/* Rating & Reviews - Minimal & Professional */}
                  {(restaurant.rating || restaurant.user_ratings_total) && (
                    <div className="flex items-center gap-3">
                      {restaurant.rating && (
                        <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" strokeWidth={2} />
                          <span className="font-bold text-yellow-700">{restaurant.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {restaurant.user_ratings_total && (
                        <div className="text-sm text-gray-600 font-medium">
                          {formatNumber(restaurant.user_ratings_total)} reviews
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {restaurant.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {restaurant.description}
                  </p>
                )}

                {/* Contact Info - Minimal & Professional */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  {restaurant.location?.address && (
                    <div className="flex items-start gap-3 group">
                      <div className="mt-0.5 flex-shrink-0">
                        <MapPin className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" strokeWidth={2} />
                      </div>
                      <span className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{restaurant.location.address}</span>
                    </div>
                  )}
                  
                  {restaurant.phone && (
                    <div className="flex items-center gap-3 group">
                      <div className="flex-shrink-0">
                        <Phone className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" strokeWidth={2} />
                      </div>
                      <a href={`tel:${restaurant.phone}`} className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Website Link - Minimal & Professional */}
                {restaurant.url && (
                  <a 
                    href={restaurant.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-2.5 w-full text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-4"
                  >
                    <Globe className="h-5 w-5" strokeWidth={2} />
                    <span>Visit Website</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

