'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Globe, ArrowRight, ArrowUpDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import dynamic from 'next/dynamic'
const CountryCard = dynamic(() => import('@/components/countries/CountryCard').then(mod => mod.CountryCard))
const AutoScrollCarousel = dynamic(() => import('@/components/home/AutoScrollCarousel'))

interface HomeCountriesSectionProps {
  countries: any[]
}

export default function HomeCountriesSection({ countries }: HomeCountriesSectionProps) {
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'popular'>('featured')

  const sortedCountries = useMemo(() => {
    const sorted = [...countries]
    
    switch (sortBy) {
      case 'featured':
        return sorted.sort((a, b) => {
          if (a.featured === b.featured) return a.name.localeCompare(b.name)
          return b.featured ? 1 : -1
        })
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'popular':
        return sorted.sort((a, b) => (b.visitors_per_year || 0) - (a.visitors_per_year || 0))
      default:
        return sorted
    }
  }, [countries, sortBy])

  return (
    <section className="w-full px-2 sm:px-4">
      <div className="relative mb-6 sm:mb-8">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-2xl opacity-50 blur-xl" />
        
        {/* Content Card */}
        <div className="relative bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
              {/* Icon */}
              <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Globe className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              
              {/* Title & Badge */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Explore Countries
                </h2>
                <span className="inline-flex items-center gap-1.5 mt-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-purple-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                  Featured Destinations
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              {/* Sort Dropdown - Desktop */}
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                <SelectTrigger className="h-10 w-[180px]">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      {sortBy === 'featured' ? 'Featured First' : sortBy === 'name' ? 'Name (A-Z)' : 'Most Popular'}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">
                    <span className="flex items-center gap-2">⭐ Featured First</span>
                  </SelectItem>
                  <SelectItem value="name">
                    <span className="flex items-center gap-2">🔤 Name (A-Z)</span>
                  </SelectItem>
                  <SelectItem value="popular">
                    <span className="flex items-center gap-2">🔥 Most Popular</span>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Link href="/countries" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all whitespace-nowrap">
                View All Countries
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Sort & View All Row */}
          <div className="sm:hidden flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-200">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
              <SelectTrigger className="h-9 flex-1 text-xs">
                <SelectValue>
                  <span className="flex items-center gap-1.5">
                    <ArrowUpDown className="h-3 w-3" />
                    {sortBy === 'featured' ? 'Featured' : sortBy === 'name' ? 'Name' : 'Popular'}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">
                  <span className="flex items-center gap-2">⭐ Featured First</span>
                </SelectItem>
                <SelectItem value="name">
                  <span className="flex items-center gap-2">🔤 Name (A-Z)</span>
                </SelectItem>
                <SelectItem value="popular">
                  <span className="flex items-center gap-2">🔥 Most Popular</span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile View All Link */}
            <Link href="/countries" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md text-xs font-medium hover:shadow-lg transition-all flex-shrink-0">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {sortedCountries.length > 0 ? (
        <AutoScrollCarousel autoScrollInterval={3500} gradientColor="gray-50">
          {sortedCountries.map((country: any, i: number) => (
            <div 
              key={country.id} 
              className="carousel-item flex-shrink-0 w-[85vw] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] opacity-0 translate-x-8 animate-[slideIn_0.6s_ease_forwards]" 
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CountryCard country={country} />
            </div>
          ))}
        </AutoScrollCarousel>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No countries available yet.</p>
        </div>
      )}
    </section>
  )
}

