'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Metric = 'avg' | 'count'

interface CountryReviewKPIProps {
  countryId?: string
  countrySlug: string
  metric: Metric
  className?: string
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function CountryReviewKPI({ countryId, countrySlug, metric, className }: CountryReviewKPIProps) {
  const [avg, setAvg] = useState<number | null>(null)
  const [count, setCount] = useState<number>(0)
  const isUuid = typeof countryId === 'string' && /^[0-9a-fA-F-]{36}$/.test(countryId)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [countRes, avgRes] = await Promise.all([
        isUuid
          ? supabase.from('country_reviews').select('*', { count: 'exact', head: true }).eq('country_id', countryId!)
          : supabase.from('country_reviews').select('*', { count: 'exact', head: true }).eq('country_slug', countrySlug),
        isUuid
          ? supabase.from('country_reviews').select('avg_rating:avg(rating)').eq('country_id', countryId!).single()
          : supabase.from('country_reviews').select('avg_rating:avg(rating)').eq('country_slug', countrySlug).single(),
      ])
      if (!mounted) return
      const cnt = countRes.count ?? 0
      setCount(cnt)
      const rawAvg = (avgRes.data as any)?.avg_rating
      let avgNum = rawAvg != null ? Number(rawAvg) : null
      if ((avgNum == null || Number.isNaN(avgNum)) && cnt > 0) {
        // Fallback: compute average client-side
        const ratingsRes = await (
          isUuid
            ? supabase.from('country_reviews').select('rating').eq('country_id', countryId!)
            : supabase.from('country_reviews').select('rating').eq('country_slug', countrySlug)
        )
        if (ratingsRes.data && Array.isArray(ratingsRes.data) && ratingsRes.data.length > 0) {
          const ratings = ratingsRes.data.map((r: any) => Number(r.rating) || 0)
          const sum = ratings.reduce((a, b) => a + b, 0)
          avgNum = sum / ratings.length
        }
      }
      setAvg(avgNum != null && !Number.isNaN(avgNum) ? Number(avgNum.toFixed(1)) : null)
    }
    load()
    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const match = (isUuid && detail.countryId === countryId) || (!isUuid && detail.countrySlug === countrySlug)
      if (match) load()
    }
    window.addEventListener('country-reviews-updated', onUpdated as EventListener)
    return () => { mounted = false; window.removeEventListener('country-reviews-updated', onUpdated as EventListener) }
  }, [countryId, countrySlug, isUuid])

  if (metric === 'avg') {
    return <span className={className}>{avg != null ? avg.toFixed(1) : '—'}</span>
  }
  return <span className={className}>{formatCount(count)}</span>
}


