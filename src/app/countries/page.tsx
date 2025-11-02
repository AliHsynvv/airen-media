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
import { useTranslations } from 'next-intl'

export default function CountriesPage() {
  const t = useTranslations('countries')
  const [query, setQuery] = useState('')
  const { data, loading } = useCountries()
  const list = useMemo(() => data || [], [data])

  // Filters
  const [continent, setContinent] = useState<'All' | string>('All')
  const [budget, setBudget] = useState<'All' | 'Budget' | 'Mid-range' | 'Luxury'>('All')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [trendingOnly, setTrendingOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'popular' | 'trending'>('name')

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
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl font-bold text-gray-900">{t('list.title')}</h1>
        <p className="text-gray-600 mt-3">{t('list.subtitle')}</p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-6">
          <div>
            <div className="text-xl font-semibold text-gray-900">{availableCount}</div>
            <div className="text-xs text-gray-500">{t('list.stats.available')}</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">{featuredCount}</div>
            <div className="text-xs text-gray-500">{t('list.stats.featured')}</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">{trendingCount}</div>
            <div className="text-xs text-gray-500">{t('list.stats.trending')}</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-row gap-2 items-center w-full">
          <div className="w-1/2 min-w-0">
            <Button asChild size="lg" className="h-12 w-full rounded-full text-white font-semibold uppercase tracking-wide px-5 sm:px-6 shadow-lg bg-gradient-to-r from-[#141432] via-[#5b21b6] to-[#a21caf] hover:from-[#1a1a44] hover:via-[#6d28d9] hover:to-[#db2777] border-0 text-xs sm:text-sm">
              <Link href="/profile">{t('list.socialMediaButton')}</Link>
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
              placeholder={t('list.controls.searchPlaceholder')}
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
                <option key={opt} value={opt}>{opt === 'All' ? t('list.controls.continentAll') : opt}</option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-gray-200 bg-white text-sm text-gray-700 px-3"
              value={budget}
              onChange={e => setBudget(e.target.value as any)}
            >
              <option value="All">{t('list.controls.budgetAll')}</option>
              <option value="Budget">{t('list.controls.budget')}</option>
              <option value="Mid-range">{t('list.controls.midRange')}</option>
              <option value="Luxury">{t('list.controls.luxury')}</option>
            </select>
            <button
              onClick={() => setFeaturedOnly(v => !v)}
              className={`inline-flex items-center gap-1 h-9 px-3 rounded-md border ${featuredOnly ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Star className="h-4 w-4" /> {t('list.controls.featuredOnly')}
            </button>
            <button
              onClick={() => setTrendingOnly(v => !v)}
              className={`inline-flex items-center gap-1 h-9 px-3 rounded-md border ${trendingOnly ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <TrendingUp className="h-4 w-4" /> {t('list.controls.trending')}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <select 
                className="h-9 rounded-md border border-gray-200 bg-white text-sm text-gray-700 px-3"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="name">{t('list.controls.sortName')}</option>
                <option value="popular">{t('list.controls.sortPopular')}</option>
                <option value="trending">Trend</option>
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


