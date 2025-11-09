'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
const CountryCard = dynamic(() => import('@/components/countries/CountryCard').then(m => m.CountryCard))
const ProfessionalWorldMap = dynamic(() => import('@/components/maps/ProfessionalWorldMap'), { ssr: false })
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
const MeetAirenButton = dynamic(() => import('@/components/home/MeetAirenButton'))
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCountries } from '@/lib/hooks/useCountries'
import { Search, TrendingUp, LayoutGrid, List, Star, Globe2, MapPin, DollarSign, CreditCard, Gem, ArrowUpDown, Flame, TrendingUp as TrendingUpIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
const GlobalSearch = dynamic(() => import('@/components/search/GlobalSearch'), { ssr: false })

export default function CountriesPage() {
  const t = useTranslations('countries')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { data, loading } = useCountries()
  const list = useMemo(() => data || [], [data])

  // Filters
  const [continent, setContinent] = useState<'All' | string>('All')
  const [budget, setBudget] = useState<'All' | 'Budget' | 'Mid-range' | 'Luxury'>('All')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [trendingOnly, setTrendingOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'popular' | 'trending'>('name')
  
  // Map location state
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; zoom?: number; name: string } | null>(null)

  // Helpers - Complete ISO to Continent mapping
  const isoToContinent: Record<string, string> = {
    // Africa
    DZ: 'Africa', AO: 'Africa', BJ: 'Africa', BW: 'Africa', BF: 'Africa', BI: 'Africa',
    CM: 'Africa', CV: 'Africa', CF: 'Africa', TD: 'Africa', KM: 'Africa', CG: 'Africa',
    CD: 'Africa', CI: 'Africa', DJ: 'Africa', EG: 'Africa', GQ: 'Africa', ER: 'Africa',
    ET: 'Africa', GA: 'Africa', GM: 'Africa', GH: 'Africa', GN: 'Africa', GW: 'Africa',
    KE: 'Africa', LS: 'Africa', LR: 'Africa', LY: 'Africa', MG: 'Africa', MW: 'Africa',
    ML: 'Africa', MR: 'Africa', MU: 'Africa', YT: 'Africa', MA: 'Africa', MZ: 'Africa',
    NA: 'Africa', NE: 'Africa', NG: 'Africa', RE: 'Africa', RW: 'Africa', SH: 'Africa',
    ST: 'Africa', SN: 'Africa', SC: 'Africa', SL: 'Africa', SO: 'Africa', ZA: 'Africa',
    SS: 'Africa', SD: 'Africa', SZ: 'Africa', TZ: 'Africa', TG: 'Africa', TN: 'Africa',
    UG: 'Africa', ZM: 'Africa', ZW: 'Africa',
    
    // Asia
    AF: 'Asia', AM: 'Asia', AZ: 'Asia', BH: 'Asia', BD: 'Asia', BT: 'Asia',
    BN: 'Asia', KH: 'Asia', CN: 'Asia', CX: 'Asia', CC: 'Asia', IO: 'Asia',
    GE: 'Asia', HK: 'Asia', IN: 'Asia', ID: 'Asia', IR: 'Asia', IQ: 'Asia',
    IL: 'Asia', JP: 'Asia', JO: 'Asia', KZ: 'Asia', KW: 'Asia', KG: 'Asia',
    LA: 'Asia', LB: 'Asia', MO: 'Asia', MY: 'Asia', MV: 'Asia', MN: 'Asia',
    MM: 'Asia', NP: 'Asia', KP: 'Asia', OM: 'Asia', PK: 'Asia', PS: 'Asia',
    PH: 'Asia', QA: 'Asia', SA: 'Asia', SG: 'Asia', KR: 'Asia', LK: 'Asia',
    SY: 'Asia', TW: 'Asia', TJ: 'Asia', TH: 'Asia', TL: 'Asia', TR: 'Asia',
    TM: 'Asia', AE: 'Asia', UZ: 'Asia', VN: 'Asia', YE: 'Asia',
    
    // Europe
    AX: 'Europe', AL: 'Europe', AD: 'Europe', AT: 'Europe', BY: 'Europe', BE: 'Europe',
    BA: 'Europe', BG: 'Europe', HR: 'Europe', CY: 'Europe', CZ: 'Europe', DK: 'Europe',
    EE: 'Europe', FO: 'Europe', FI: 'Europe', FR: 'Europe', DE: 'Europe', GI: 'Europe',
    GR: 'Europe', GG: 'Europe', VA: 'Europe', HU: 'Europe', IS: 'Europe', IE: 'Europe',
    IM: 'Europe', IT: 'Europe', JE: 'Europe', LV: 'Europe', LI: 'Europe', LT: 'Europe',
    LU: 'Europe', MK: 'Europe', MT: 'Europe', MD: 'Europe', MC: 'Europe', ME: 'Europe',
    NL: 'Europe', NO: 'Europe', PL: 'Europe', PT: 'Europe', RO: 'Europe', RU: 'Europe',
    SM: 'Europe', RS: 'Europe', SK: 'Europe', SI: 'Europe', ES: 'Europe', SJ: 'Europe',
    SE: 'Europe', CH: 'Europe', UA: 'Europe', GB: 'Europe', UK: 'Europe',
    
    // North America
    AI: 'North America', AG: 'North America', AW: 'North America', BS: 'North America',
    BB: 'North America', BZ: 'North America', BM: 'North America', BQ: 'North America',
    CA: 'North America', KY: 'North America', CR: 'North America', CU: 'North America',
    CW: 'North America', DM: 'North America', DO: 'North America', SV: 'North America',
    GL: 'North America', GD: 'North America', GP: 'North America', GT: 'North America',
    HT: 'North America', HN: 'North America', JM: 'North America', MQ: 'North America',
    MX: 'North America', MS: 'North America', NI: 'North America', PA: 'North America',
    PM: 'North America', PR: 'North America', BL: 'North America', KN: 'North America',
    LC: 'North America', MF: 'North America', VC: 'North America', SX: 'North America',
    TT: 'North America', TC: 'North America', US: 'North America', VG: 'North America',
    VI: 'North America',
    
    // South America
    AR: 'South America', BO: 'South America', BR: 'South America', CL: 'South America',
    CO: 'South America', EC: 'South America', FK: 'South America', GF: 'South America',
    GY: 'South America', PY: 'South America', PE: 'South America', SR: 'South America',
    UY: 'South America', VE: 'South America',
    
    // Oceania
    AS: 'Oceania', AU: 'Oceania', CK: 'Oceania', FJ: 'Oceania', PF: 'Oceania',
    GU: 'Oceania', KI: 'Oceania', MH: 'Oceania', FM: 'Oceania', NR: 'Oceania',
    NC: 'Oceania', NZ: 'Oceania', NU: 'Oceania', NF: 'Oceania', MP: 'Oceania',
    PW: 'Oceania', PG: 'Oceania', PN: 'Oceania', WS: 'Oceania', SB: 'Oceania',
    TK: 'Oceania', TO: 'Oceania', TV: 'Oceania', VU: 'Oceania', WF: 'Oceania',
    
    // Antarctica
    AQ: 'Antarctica', BV: 'Antarctica', TF: 'Antarctica', HM: 'Antarctica', GS: 'Antarctica'
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
    let result = list
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.capital || '').toLowerCase().includes(q) ||
        (c.popular_activities || []).some(a => a.toLowerCase().includes(q))
      )
      .filter(c => (continent === 'All') ? true : getContinent(c.iso_code) === continent)
      .filter(c => (budget === 'All') ? true : getBudgetLabel(c) === budget)
      .filter(c => (featuredOnly ? !!c.featured : true))
      .filter(c => (trendingOnly ? isTrending(c) : true))
    
    // Sorting
    if (sortBy === 'name') {
      result = result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'popular') {
      result = result.sort((a, b) => (b.visitors_per_year || 0) - (a.visitors_per_year || 0))
    } else if (sortBy === 'trending') {
      result = result.sort((a, b) => {
        const scoreA = a.trending_score ?? (a.popular_activities?.length || 0) * 10
        const scoreB = b.trending_score ?? (b.popular_activities?.length || 0) * 10
        return scoreB - scoreA
      })
    }
    
    return result
  }, [query, list, continent, budget, featuredOnly, trendingOnly, sortBy])

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
      {/* Global Search - Professional */}
      <div className="mb-8">
        <GlobalSearch 
          onLocationSelect={(location) => {
            setSelectedLocation(location)
          }}
        />
      </div>

      {/* Professional Interactive Map */}
      <div className="mb-8">
        <ProfessionalWorldMap 
          countries={list}
          selectedLocation={selectedLocation}
          onCountryClick={(country) => {
            if (country?.slug) {
              router.push(`/countries/${country.slug}`)
            }
          }}
        />
      </div>

      {/* CTAs - Compact */}
      <div className="mb-8 flex flex-row gap-3 items-center max-w-4xl mx-auto">
        <div className="flex-1">
          <Button asChild size="lg" className="h-11 w-full rounded-lg text-white font-semibold px-6 shadow-md bg-gradient-to-r from-[#141432] via-[#5b21b6] to-[#a21caf] hover:from-[#1a1a44] hover:via-[#6d28d9] hover:to-[#db2777] border-0 text-sm">
            <Link href="/profile">{t('list.socialMediaButton')}</Link>
          </Button>
        </div>
        <div className="flex-1">
          <MeetAirenButton fullWidth className="text-sm h-11" />
        </div>
      </div>

      {/* Controls - Modern Design */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-lg backdrop-blur-sm px-6 py-6 mb-8 transition-all hover:shadow-xl">
        <div className="flex flex-col gap-5">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <Input
                className="pl-12 pr-4 h-14 rounded-xl border-2 border-gray-200 bg-white text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                placeholder={t('list.controls.searchPlaceholder')}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left: Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Continent */}
              <Select value={continent} onValueChange={(val) => setContinent(val as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    {continent === 'All' ? (
                      <span className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4 text-gray-600" />
                        {t('list.controls.continentAll')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        {continent}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">
                    <span className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4" />
                      {t('list.controls.continentAll')}
                    </span>
                  </SelectItem>
                  {continentOptions.filter(opt => opt !== 'All').map(opt => (
                    <SelectItem key={opt} value={opt}>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {opt}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Budget */}
              <Select value={budget} onValueChange={(val) => setBudget(val as any)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue>
                    {budget === 'All' ? (
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-600" />
                        {t('list.controls.budgetAll')}
                      </span>
                    ) : budget === 'Budget' ? (
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-600" />
                        {t('list.controls.budget')}
                      </span>
                    ) : budget === 'Mid-range' ? (
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-600" />
                        {t('list.controls.midRange')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Gem className="h-4 w-4 text-gray-600" />
                        {t('list.controls.luxury')}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t('list.controls.budgetAll')}
                    </span>
                  </SelectItem>
                  <SelectItem value="Budget">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t('list.controls.budget')}
                    </span>
                  </SelectItem>
                  <SelectItem value="Mid-range">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {t('list.controls.midRange')}
                    </span>
                  </SelectItem>
                  <SelectItem value="Luxury">
                    <span className="flex items-center gap-2">
                      <Gem className="h-4 w-4" />
                      {t('list.controls.luxury')}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Featured Only */}
              <button
                onClick={() => setFeaturedOnly(v => !v)}
                className={`inline-flex items-center gap-2 h-11 px-5 rounded-xl border-2 font-semibold text-sm transition-all shadow-sm hover:shadow-md ${
                  featuredOnly 
                    ? 'border-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-yellow-400/20' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-400 hover:bg-yellow-50'
                }`}
              >
                <Star className={`h-4 w-4 ${featuredOnly ? 'fill-current' : ''}`} />
                <span>{t('list.controls.featuredOnly')}</span>
              </button>

              {/* Trending */}
              <button
                onClick={() => setTrendingOnly(v => !v)}
                className={`inline-flex items-center gap-2 h-11 px-5 rounded-xl border-2 font-semibold text-sm transition-all shadow-sm hover:shadow-md ${
                  trendingOnly 
                    ? 'border-pink-400 bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-400/20' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-pink-400 hover:bg-pink-50'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>{t('list.controls.trending')}</span>
              </button>
            </div>

            {/* Right: Sort & View Controls */}
            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    {sortBy === 'name' ? (
                      <span className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-gray-600" />
                        {t('list.controls.sortName')}
                      </span>
                    ) : sortBy === 'popular' ? (
                      <span className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-gray-600" />
                        {t('list.controls.sortPopular')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <TrendingUpIcon className="h-4 w-4 text-gray-600" />
                        Trend
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">
                    <span className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      {t('list.controls.sortName')}
                    </span>
                  </SelectItem>
                  <SelectItem value="popular">
                    <span className="flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      {t('list.controls.sortPopular')}
                    </span>
                  </SelectItem>
                  <SelectItem value="trending">
                    <span className="flex items-center gap-2">
                      <TrendingUpIcon className="h-4 w-4" />
                      Trend
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle Buttons */}
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
                <button className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-white text-gray-900 shadow-sm transition-all hover:scale-105">
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all hover:scale-105">
                  <List className="h-4 w-4" />
                </button>
              </div>
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
            {t('list.showing', { filtered: filtered.length, total: list.length })}
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


