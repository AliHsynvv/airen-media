'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Building2, ArrowRight, ArrowUpDown, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import dynamic from 'next/dynamic'
const BusinessCard = dynamic(() => import('@/components/business/BusinessCard'))
const AutoScrollCarousel = dynamic(() => import('@/components/home/AutoScrollCarousel'))

interface HomeCompaniesSectionProps {
  companies: any[]
}

export default function HomeCompaniesSection({ companies }: HomeCompaniesSectionProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'newest'>('rating')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(companies.map(c => c.category).filter(Boolean))
    return ['all', ...Array.from(cats)].sort()
  }, [companies])

  // Filter and sort
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = [...companies]
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => c.category === filterCategory)
    }
    
    // Sort
    switch (sortBy) {
      case 'rating':
        return filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
      case 'newest':
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      default:
        return filtered
    }
  }, [companies, sortBy, filterCategory])

  return (
    <section className="w-full px-2 sm:px-4">
      <div className="relative mb-6 sm:mb-8">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-2xl opacity-50 blur-xl" />
        
        {/* Content Card */}
        <div className="relative bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
              {/* Icon */}
              <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              
              {/* Title & Badge */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Companies
                </h2>
                <span className="inline-flex items-center gap-1.5 mt-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-orange-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                  Top Rated Companies
                </span>
              </div>

            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              {/* Category Filter - Desktop */}
              {categories.length > 1 && (
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-10 w-[160px]">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        {filterCategory === 'all' ? 'All Types' : filterCategory}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">🏢 All Types</span>
                    </SelectItem>
                    {categories.filter(c => c !== 'all').map(cat => (
                      <SelectItem key={cat} value={cat}>
                        <span className="flex items-center gap-2">
                          {cat === 'Tourism' ? '✈️' : cat === 'Aviation' ? '🛫' : cat === 'Restaurant' ? '🍽️' : cat === 'Hotel' ? '🏨' : '🏢'} {cat}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Sort Dropdown - Desktop */}
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                <SelectTrigger className="h-10 w-[170px]">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      {sortBy === 'rating' ? 'Highest Rated' : sortBy === 'name' ? 'Name (A-Z)' : 'Newest First'}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">
                    <span className="flex items-center gap-2">⭐ Highest Rated</span>
                  </SelectItem>
                  <SelectItem value="name">
                    <span className="flex items-center gap-2">🔤 Name (A-Z)</span>
                  </SelectItem>
                  <SelectItem value="newest">
                    <span className="flex items-center gap-2">🆕 Newest First</span>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Link href="/business" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all whitespace-nowrap">
                View All Companies
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Filter & Sort Row */}
          <div className="sm:hidden flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-1">
              {/* Category Filter */}
              {categories.length > 1 && (
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-9 flex-1 text-xs">
                    <SelectValue>
                      <span className="flex items-center gap-1.5">
                        <Filter className="h-3 w-3" />
                        {filterCategory === 'all' ? 'All' : filterCategory}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">🏢 All Types</span>
                    </SelectItem>
                    {categories.filter(c => c !== 'all').map(cat => (
                      <SelectItem key={cat} value={cat}>
                        <span className="flex items-center gap-2">
                          {cat === 'Tourism' ? '✈️' : cat === 'Aviation' ? '🛫' : cat === 'Restaurant' ? '🍽️' : cat === 'Hotel' ? '🏨' : '🏢'} {cat}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                <SelectTrigger className="h-9 flex-1 text-xs">
                  <SelectValue>
                    <span className="flex items-center gap-1.5">
                      <ArrowUpDown className="h-3 w-3" />
                      {sortBy === 'rating' ? 'Rating' : sortBy === 'name' ? 'Name' : 'Newest'}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">
                    <span className="flex items-center gap-2">⭐ Highest Rated</span>
                  </SelectItem>
                  <SelectItem value="name">
                    <span className="flex items-center gap-2">🔤 Name (A-Z)</span>
                  </SelectItem>
                  <SelectItem value="newest">
                    <span className="flex items-center gap-2">🆕 Newest First</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile View All Link */}
            <Link href="/business" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md text-xs font-medium hover:shadow-lg transition-all flex-shrink-0">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {filteredAndSortedCompanies.length > 0 ? (
        <AutoScrollCarousel autoScrollInterval={4000} gradientColor="gray-50">
          {filteredAndSortedCompanies.map((company: any, i: number) => (
            <div 
              key={company.id} 
              className="carousel-item flex-shrink-0 w-[85vw] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] opacity-0 translate-x-8 animate-[slideIn_0.6s_ease_forwards]" 
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <BusinessCard business={company} />
            </div>
          ))}
        </AutoScrollCarousel>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No companies yet. Be the first to add your company!</p>
          <Link href="/business/me" className="inline-block mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Add Your Company →
          </Link>
        </div>
      )}
    </section>
  )
}

