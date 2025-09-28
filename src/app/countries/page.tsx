'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
const CountryCard = dynamic(() => import('@/components/countries/CountryCard').then(m => m.CountryCard))
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
const MeetAirenButton = dynamic(() => import('@/components/home/MeetAirenButton'))
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useCountries } from '@/lib/hooks/useCountries'
import { Search, TrendingUp, LayoutGrid, List, Star, ChevronDown } from 'lucide-react'

export default function CountriesPage() {
  const [query, setQuery] = useState('')
  const { data, loading } = useCountries()
  const list = useMemo(() => data || [], [data])

  // Filters
  const [continent, setContinent] = useState<'All' | string>('All')
  const [budget, setBudget] = useState<'All' | 'Budget' | 'Mid-range' | 'Luxury'>('All')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [trendingOnly, setTrendingOnly] = useState(false)

  // Helpers
  const isoToContinent: Record<string, string> = {
    // EMEA
    TR: 'Asia', FR: 'Europe', DE: 'Europe', IT: 'Europe', ES: 'Europe', GB: 'Europe',
    // AMER
    US: 'North America', CA: 'North America', BR: 'South America', AR: 'South America',
    // APAC
    CN: 'Asia', JP: 'Asia', KR: 'Asia', AU: 'Oceania', NZ: 'Oceania'
  }
  const getContinent = (iso?: string | null): string => {
    const code = (iso || '').toUpperCase()
    return isoToContinent[code] || 'Other'
  }
  const getBudgetLabel = (c: any): 'Budget' | 'Mid-range' | 'Luxury' => {
    const daily = c?.average_budget?.daily ?? 80
    return daily >= 120 ? 'Luxury' : daily >= 70 ? 'Mid-range' : 'Budget'
  }
  const isTrending = (c: any): boolean => {
    if (typeof c?.trending_score === 'number') return c.trending_score >= 50
    return (c?.popular_activities || []).length >= 3
  }

  const continentOptions = useMemo(() => {
    const set = new Set<string>()
    for (const c of list) set.add(getContinent(c.iso_code))
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [list])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return list
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.capital || '').toLowerCase().includes(q) ||
        (c.popular_activities || []).some(a => a.toLowerCase().includes(q))
      )
      .filter(c => (continent === 'All') ? true : getContinent(c.iso_code) === continent)
      .filter(c => (budget === 'All') ? true : getBudgetLabel(c) === budget)
      .filter(c => (featuredOnly ? !!c.featured : true))
      .filter(c => (trendingOnly ? isTrending(c) : true))
  }, [query, list, continent, budget, featuredOnly, trendingOnly])

  const popularActivities = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of list) {
      for (const a of c.popular_activities || []) {
        const key = a.trim()
        if (!key) continue
        counts[key] = (counts[key] || 0) + 1
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))
  }, [list])

  // simple derived stats for header
  const availableCount = list.length
  const featuredCount = list.filter(c => !!c.featured).length
  const trendingCount = list.filter(c => isTrending(c)).length

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Explore Countries</h1>
        <p className="text-gray-600 mt-3">Discover amazing destinations around the world</p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-6">
          <div>
            <div className="text-xl font-semibold text-gray-900">{availableCount}</div>
            <div className="text-xs text-gray-500">countries available</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">{featuredCount}</div>
            <div className="text-xs text-gray-500">featured destinations</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">{trendingCount}</div>
            <div className="text-xs text-gray-500">trending now</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-row gap-2 items-center w-full">
          <div className="w-1/2 min-w-0">
            <Button asChild size="lg" className="h-12 w-full rounded-full text-white font-semibold uppercase tracking-wide px-5 sm:px-6 shadow-lg bg-gradient-to-r from-[#141432] via-[#5b21b6] to-[#a21caf] hover:from-[#1a1a44] hover:via-[#6d28d9] hover:to-[#db2777] border-0 text-xs sm:text-sm">
              <Link href="/profile">Airen Social Media</Link>
            </Button>
          </div>
          <div className="w-1/2 min-w-0">
            <MeetAirenButton fullWidth className="text-xs sm:text-sm" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 mb-8">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 h-11 rounded-lg border-gray-200"
              placeholder="Search countries..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-9 rounded-md border border-gray-200 bg-white text-sm text-gray-700 px-3"
              value={continent}
              onChange={e => setContinent(e.target.value as any)}
            >
              {continentOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'All' ? 'Continent: All' : opt}</option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-gray-200 bg-white text-sm text-gray-700 px-3"
              value={budget}
              onChange={e => setBudget(e.target.value as any)}
            >
              <option value="All">Budget Level: All</option>
              <option value="Budget">Budget</option>
              <option value="Mid-range">Mid-range</option>
              <option value="Luxury">Luxury</option>
            </select>
            <button
              onClick={() => setFeaturedOnly(v => !v)}
              className={`inline-flex items-center gap-1 h-9 px-3 rounded-md border ${featuredOnly ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Star className="h-4 w-4" /> Featured Only
            </button>
            <button
              onClick={() => setTrendingOnly(v => !v)}
              className={`inline-flex items-center gap-1 h-9 px-3 rounded-md border ${trendingOnly ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <TrendingUp className="h-4 w-4" /> Trending
            </button>
            <div className="ml-auto flex items-center gap-2">
              <select className="h-9 rounded-md border border-gray-200 bg-white text-sm text-gray-700 px-3">
                <option>Name</option>
                <option>Popular</option>
              </select>
              <button className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-4">
            Showing {filtered.length} of {list.length} countries
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(country => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
        </>
      )}

      
    </div>
  )
}


