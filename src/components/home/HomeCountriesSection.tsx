'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Globe, ArrowRight } from 'lucide-react'
import dynamic from 'next/dynamic'
const CountryCard = dynamic(() => import('@/components/countries/CountryCard').then(mod => mod.CountryCard))
const AutoScrollCarousel = dynamic(() => import('@/components/home/AutoScrollCarousel'))
const GoogleLikeMap = dynamic(() => import('@/components/maps/GoogleLikeMap'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 sm:p-8 lg:p-12 overflow-hidden animate-pulse">
      <div className="h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Loading interactive map...</p>
        </div>
      </div>
    </div>
  )
})

interface HomeCountriesSectionProps {
  countries: any[]
}

export default function HomeCountriesSection({ countries }: HomeCountriesSectionProps) {
  const sortedCountries = useMemo(() => {
    const sorted = [...countries]
    // Sort by featured first, then by name
    return sorted.sort((a, b) => {
      if (a.featured === b.featured) return a.name.localeCompare(b.name)
      return b.featured ? 1 : -1
    })
  }, [countries])

  return (
    <section className="w-full px-2 sm:px-4">
      {/* Google-Like Interactive Map Header */}
      <div className="mb-8 sm:mb-12">
        <GoogleLikeMap countries={sortedCountries} />
      </div>

      {/* Simple Action Bar */}
      <div className="relative mb-6 sm:mb-8">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-2xl opacity-50 blur-xl" />
        
        {/* Content Card */}
        <div className="relative bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Globe className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              
              {/* Title & Badge */}
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Featured Countries
                </h2>
                <span className="inline-flex items-center gap-1.5 mt-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-purple-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                  Handpicked Destinations
                </span>
              </div>
            </div>
            
            {/* View All Links */}
            <Link href="/countries" className="sm:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md text-xs font-medium hover:shadow-lg transition-all">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/countries" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all">
              View All Countries
              <ArrowRight className="h-4 w-4" />
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

