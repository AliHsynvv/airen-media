'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, MapPin, Building2, Utensils, Hotel, Landmark, Globe, TrendingUp, Star, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'

interface SearchResult {
  id: string
  type: 'country' | 'city' | 'place' | 'hotel' | 'restaurant'
  name: string
  description?: string
  location?: string
  image?: string
  rating?: number
  slug?: string
  latitude?: number
  longitude?: number
  featured?: boolean
  trending?: boolean
}

interface GlobalSearchProps {
  onLocationSelect?: (location: { lat: number; lng: number; zoom?: number; name: string }) => void
}

export default function GlobalSearch({ onLocationSelect }: GlobalSearchProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search function
  const searchGlobal = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
        const searchLower = searchQuery.toLowerCase()
        const allResults: SearchResult[] = []

        // Search Countries
        const { data: countries, error: countriesError } = await supabase
          .from('countries')
          .select('id, name, slug, flag_icon, capital, culture_description, featured, trending_score, latitude, longitude, view_count, climate_info, best_time_to_visit, population, official_language, currency, currency_code, budget_level, visa_required')
          .or(`name.ilike.%${searchQuery}%,capital.ilike.%${searchQuery}%,culture_description.ilike.%${searchQuery}%`)
          .limit(20)
        
        if (countriesError) {
          console.error('❌ Countries search error:', countriesError)
        } else {
          console.log('✅ Countries found:', countries?.length || 0)
        }

        if (countries) {
          countries.forEach((country: any) => {
            allResults.push({
              id: country.id,
              type: 'country',
              name: country.name,
              description: country.culture_description || `Explore ${country.name}`,
              location: country.capital || '',
              image: country.flag_icon,
              slug: country.slug,
              featured: country.featured,
              trending: (country.trending_score || 0) >= 50,
              latitude: country.latitude,
              longitude: country.longitude
            })
          })
        }

        // Search Top Places & Activities
        const { data: placesData } = await supabase
          .from('countries')
          .select('id, name, slug, top_places, popular_activities, flag_icon')
          .limit(100)

        if (placesData) {
          placesData.forEach(country => {
            // Search in top_places
            if (country.top_places && Array.isArray(country.top_places)) {
              country.top_places.forEach((place: any) => {
                if (place.name && place.name.toLowerCase().includes(searchLower)) {
                  allResults.push({
                    id: `place-${country.id}-${place.name}`,
                    type: 'place',
                    name: place.name,
                    description: place.description || `Famous landmark in ${country.name}`,
                    location: country.name,
                    image: place.image,
                    slug: country.slug,
                  })
                }
              })
            }
            
            // Search in popular_activities
            if (country.popular_activities && Array.isArray(country.popular_activities)) {
              country.popular_activities.forEach((activity: string) => {
                if (activity && activity.toLowerCase().includes(searchLower)) {
                  allResults.push({
                    id: `activity-${country.id}-${activity}`,
                    type: 'place',
                    name: activity,
                    description: `Popular activity in ${country.name}`,
                    location: country.name,
                    image: country.flag_icon,
                    slug: country.slug,
                  })
                }
              })
            }
          })
        }
        
        console.log('Total results:', allResults.length)

        // Sort results: featured/trending first, then by relevance
        allResults.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          if (a.trending && !b.trending) return -1
          if (!a.trending && b.trending) return 1
          
          // Exact match first
          const aExact = a.name.toLowerCase() === searchLower
          const bExact = b.name.toLowerCase() === searchLower
          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          
          return 0
        })

        setResults(allResults.slice(0, 12))
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchGlobal(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        handleResultClick(results[selectedIndex])
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  const handleResultClick = (result: SearchResult) => {
    // Send location to map if coordinates are available
    if (result.latitude && result.longitude && onLocationSelect) {
      onLocationSelect({
        lat: result.latitude,
        lng: result.longitude,
        zoom: result.type === 'country' ? 6 : result.type === 'city' ? 10 : 12,
        name: result.name
      })
      
      // Close search dropdown
      setIsOpen(false)
      setQuery('')
      setResults([])
    } else {
      // If no coordinates, navigate to the page instead
      setIsOpen(false)
      setQuery('')
      setResults([])
      
      if (result.type === 'country') {
        router.push(`/countries/${result.slug}`)
      } else if (result.type === 'place') {
        router.push(`/countries/${result.slug}`)
      }
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'country':
        return <Globe className="w-5 h-5" />
      case 'city':
        return <Building2 className="w-5 h-5" />
      case 'place':
        return <Landmark className="w-5 h-5" />
      case 'hotel':
        return <Hotel className="w-5 h-5" />
      case 'restaurant':
        return <Utensils className="w-5 h-5" />
      default:
        return <MapPin className="w-5 h-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'country':
        return 'Country'
      case 'city':
        return 'City'
      case 'place':
        return 'Place'
      case 'hotel':
        return 'Hotel'
      case 'restaurant':
        return 'Restaurant'
      default:
        return 'Location'
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className={`relative group transition-all duration-300 ${isOpen ? 'scale-105' : ''}`}>
        {/* Glow effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-75 blur-lg transition-opacity ${isOpen ? 'opacity-75' : ''}`} />
        
        {/* Input container */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Search className={`w-5 h-5 transition-colors ${isOpen ? 'text-purple-600' : 'text-gray-400'}`} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search countries, cities, places, hotels, restaurants..."
            className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-lg hover:shadow-xl"
          />
          
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setResults([])
                setIsOpen(false)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <>
              {/* Results header */}
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Results list */}
              <div className="divide-y divide-gray-100">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full px-4 py-3 flex items-start gap-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all text-left group ${
                      selectedIndex === index ? 'bg-gradient-to-r from-purple-50 to-pink-50' : ''
                    }`}
                  >
                    {/* Icon/Image */}
                    <div className="flex-shrink-0 mt-1">
                      {result.image && result.image.startsWith('http') ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-purple-300 transition-colors">
                          <Image
                            src={result.image}
                            alt={result.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : result.image ? (
                        <div className="w-12 h-12 rounded-lg border-2 border-gray-200 group-hover:border-purple-300 transition-colors flex items-center justify-center text-3xl">
                          {result.image}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                          {getIcon(result.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                          {result.name}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {result.featured && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              ⭐ Featured
                            </span>
                          )}
                          {result.trending && (
                            <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                              🔥 Trending
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {getTypeLabel(result.type)}
                        </span>
                        {result.location && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {result.location}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {result.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {result.description}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 mt-3">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>

              {/* View all results */}
              {results.length >= 12 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query)}`)
                      setIsOpen(false)
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              )}
            </>
          ) : query && !loading ? (
            <div className="px-4 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-sm text-gray-600">
                Try searching for countries, cities, or landmarks
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 px-4 py-2 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Esc</kbd>
            Close
          </span>
        </div>
      )}
    </div>
  )
}

