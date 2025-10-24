'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CountryCardReviewProps {
  countryId?: string
  countrySlug: string
  variant?: 'badge' | 'inline'
  fallbackRating?: number
  className?: string
  withReviewsLabel?: boolean
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function CountryCardReview({ countryId, countrySlug, variant = 'inline', fallbackRating, className, withReviewsLabel }: CountryCardReviewProps) {
  const t = useTranslations('countries.cardReview')
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [totalStars, setTotalStars] = useState<number | null>(null)
  const isUuid = typeof countryId === 'string' && /^[0-9a-fA-F-]{36}$/.test(countryId)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [countRes, avgRes, sumRes] = await Promise.all([
        isUuid
          ? supabase.from('country_reviews').select('*', { count: 'exact', head: true }).eq('country_id', countryId!)
          : supabase.from('country_reviews').select('*', { count: 'exact', head: true }).eq('country_slug', countrySlug),
        isUuid
          ? supabase.from('country_reviews').select('avg_rating:avg(rating)').eq('country_id', countryId!).single<{ avg_rating: number | null }>()
          : supabase.from('country_reviews').select('avg_rating:avg(rating)').eq('country_slug', countrySlug).single<{ avg_rating: number | null }>(),
        isUuid
          ? supabase.from('country_reviews').select('sum_rating:sum(rating)').eq('country_id', countryId!).single<{ sum_rating: number | null }>()
          : supabase.from('country_reviews').select('sum_rating:sum(rating)').eq('country_slug', countrySlug).single<{ sum_rating: number | null }>(),
      ])
      if (!mounted) return
      const cnt = countRes.count ?? 0
      setCount(cnt)
      const rawAvg = (avgRes.data)?.avg_rating
      const avgNum = rawAvg != null ? Number(rawAvg) : null
      setAvgRating(avgNum != null && !Number.isNaN(avgNum) ? Number(avgNum.toFixed(1)) : null)
      const rawSum = (sumRes.data)?.sum_rating ?? (sumRes.data as unknown as { sum?: number })?.sum
      let sumNum = rawSum != null ? Number(rawSum) : null
      if ((sumNum == null || Number.isNaN(sumNum)) && avgNum != null && cnt > 0) {
        sumNum = Math.round(avgNum * cnt)
      }
      // Fallback: if aggregates missing, compute on client
      if ((avgNum == null || sumNum == null) && cnt > 0) {
        const ratingsRes = await (
          isUuid
            ? supabase.from('country_reviews').select('rating').eq('country_id', countryId!)
            : supabase.from('country_reviews').select('rating').eq('country_slug', countrySlug)
        )
        if (ratingsRes.data && Array.isArray(ratingsRes.data) && ratingsRes.data.length > 0) {
          const ratings = ratingsRes.data.map((r: { rating: number | null }) => Number(r.rating) || 0)
          const localSum = ratings.reduce((a, b) => a + b, 0)
          const localAvg = ratings.length ? localSum / ratings.length : null
          if (localAvg != null) setAvgRating(Number(localAvg.toFixed(1)))
          setTotalStars(localSum)
          return
        }
      }
      setTotalStars(sumNum ?? 0)
    }
    load()
    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const match = (isUuid && detail.countryId === countryId) || (!isUuid && detail.countrySlug === countrySlug)
      if (match) load()
    }
    window.addEventListener('country-reviews-updated', onUpdated as EventListener)
    return () => { mounted = false; window.removeEventListener('country-reviews-updated', onUpdated as EventListener) }
  }, [countryId, countrySlug, isUuid, fallbackRating])

  const ratingToShow = avgRating ?? (fallbackRating !== undefined ? Number(fallbackRating.toFixed(1)) : null)
  const countToShow = count ?? 0

  if (variant === 'badge') {
    return (
      <div className={`absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 text-gray-800 border border-gray-200 px-2 py-0.5 text-xs shadow ${className || ''}`}>
        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {ratingToShow ? ratingToShow.toFixed(1) : '—'}
      </div>
    )
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className || ''}`}>
      <span className="inline-flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> {ratingToShow ? ratingToShow.toFixed(1) : '—'}
      </span>
      <span className="text-gray-400">
        {(() => {
          const parts: string[] = []
          if (withReviewsLabel) {
            parts.push(t('reviewsLabel', { count: formatCount(countToShow) }))
          } else {
            parts.push(formatCount(countToShow))
          }
          if (typeof totalStars === 'number') {
            parts.push(t('starsLabel', { count: formatCount(totalStars) }))
          }
          return `(${parts.join(', ')})`
        })()}
      </span>
    </span>
  )
}


