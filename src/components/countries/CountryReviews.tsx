'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, User, ThumbsUp, Calendar, Sparkles, TrendingUp } from 'lucide-react'
import Image from 'next/image'

interface CountryReviewsProps {
  countryId?: string
  countrySlug: string
  className?: string
}

interface ReviewRow {
  id: string
  user_id: string
  country_slug: string
  rating: number
  comment: string | null
  created_at: string
}

export default function CountryReviews({ countryId, countrySlug, className }: CountryReviewsProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [list, setList] = useState<ReviewRow[]>([])
  const [profiles, setProfiles] = useState<Record<string, { id: string; full_name: string | null; username: string | null; avatar_url: string | null }>>({})
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isUuid = typeof countryId === 'string' && /^[0-9a-fA-F-]{36}$/.test(countryId)

  const displayStars = hoverRating || rating

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (mounted) setUserId(userData.user?.id ?? null)
        const { data } = await (isUuid
          ? supabase
              .from('country_reviews')
              .select('id,user_id,country_slug,rating,comment,created_at')
              .eq('country_id', countryId!)
              .order('created_at', { ascending: false })
          : supabase
              .from('country_reviews')
              .select('id,user_id,country_slug,rating,comment,created_at')
              .eq('country_slug', countrySlug)
              .order('created_at', { ascending: false })
        )
        if (mounted) setList(data || [])
        // Bulk load profiles for authors
        const userIds = Array.from(new Set((data || []).map(r => r.user_id)))
        if (userIds.length) {
          const { data: profs } = await supabase
            .from('users_profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', userIds)
          const map: Record<string, { id: string; full_name: string | null; username: string | null; avatar_url: string | null }> = {}
          for (const p of profs || []) map[p.id] = p
          if (mounted) setProfiles(map)
        } else {
          if (mounted) setProfiles({})
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error'
        if (mounted) setError(msg)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [countryId, countrySlug, isUuid])

  const avgRating = useMemo(() => {
    if (!list.length) return 0
    const sum = list.reduce((acc, r) => acc + (r.rating || 0), 0)
    return Math.round((sum / list.length) * 10) / 10
  }, [list])

  const submit = async () => {
    if (!userId) { window.location.href = '/auth/login'; return }
    if (!isUuid) { alert('Bu ülke demo verisi. Gerçek ülkede puan verebilirsiniz.'); return }
    if (rating < 1 || rating > 5) { alert('Lütfen 1-5 arası bir puan seçin.'); return }
    setSubmitting(true)
    setError(null)
    try {
      // Insert new comment (allow multiple per user)
      const { error } = await supabase
        .from('country_reviews')
        .insert({ user_id: userId, country_id: countryId!, country_slug: countrySlug, rating, comment: comment.trim() || null })
      if (error) throw error
      setComment('')
      setRating(0)
      // refresh
      const { data } = await supabase
        .from('country_reviews')
        .select('id,user_id,country_slug,rating,comment,created_at')
        .eq('country_id', countryId!)
        .order('created_at', { ascending: false })
      setList(data || [])
      // refresh profiles as well
      const userIds = Array.from(new Set((data || []).map(r => r.user_id)))
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('users_profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', userIds)
        const map: Record<string, { id: string; full_name: string | null; username: string | null; avatar_url: string | null }> = {}
        for (const p of profs || []) map[p.id] = p
        setProfiles(map)
      } else {
        setProfiles({})
      }
      // notify listeners to refresh aggregates
      window.dispatchEvent(new CustomEvent('country-reviews-updated', { detail: { countryId, countrySlug } }))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]
    list.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating - 1]++
      }
    })
    return dist
  }, [list])

  return (
    <div className={className}>
      {/* Rating Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overall Rating */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-3">
              <div className="text-3xl font-bold text-gray-900">
                {avgRating ? avgRating.toFixed(1) : '—'}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(n => (
                <Star key={n} className={`h-5 w-5 ${avgRating >= n ? 'fill-amber-400 text-amber-400' : avgRating >= n - 0.5 ? 'fill-amber-200 text-amber-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {list.length} {list.length === 1 ? 'Review' : 'Reviews'}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingDistribution[rating - 1]
              const percentage = list.length > 0 ? (count / list.length) * 100 : 0
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Write Review Form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Share Your Experience</h3>
            <p className="text-sm text-gray-600">Help others by sharing your thoughts</p>
        </div>
      </div>

        <div className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
            <div className="flex items-center gap-2">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              type="button"
                  className="group transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(n)}
            >
                  <Star className={`h-8 w-8 transition-colors ${displayStars >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300 group-hover:text-amber-200'}`} />
            </button>
          ))}
              <span className="ml-3 text-sm font-bold text-gray-700 bg-white rounded-full px-3 py-1 border-2 border-blue-200">
                {displayStars || 0}/5
              </span>
            </div>
        </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review (Optional)</label>
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
              placeholder="Share details of your experience..."
              className="min-h-[100px] bg-white border-2 border-blue-200 focus:border-blue-400 rounded-xl"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={submit} 
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
            {!userId && (
              <span className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border border-blue-200">
                Please <a href="/auth/login" className="text-blue-600 font-semibold hover:underline">sign in</a> to review
              </span>
            )}
            {error && (
              <span className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                {error}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">All Reviews</h3>
          {list.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing {list.length} {list.length === 1 ? 'review' : 'reviews'}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && list.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-3">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No reviews yet</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to share your experience!</p>
          </div>
        )}

        {list.map((r, idx) => {
          const profile = profiles[r.user_id]
          const avatarUrl = profile?.avatar_url ?? null
          const displayName = profile?.full_name || profile?.username || 'Anonymous User'
          
          return (
            <div 
              key={r.id} 
              className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="relative">
                  {avatarUrl ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all">
                      <Image 
                        src={avatarUrl} 
                        alt={displayName} 
                        fill 
                        className="object-cover" 
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>

                {/* User Info & Rating */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 truncate">{displayName}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(r.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full px-3 py-1.5">
              {[1,2,3,4,5].map(n => (
                        <Star 
                          key={n} 
                          className={`h-4 w-4 ${r.rating >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="ml-1 text-sm font-bold text-gray-900">{r.rating}.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment */}
              {r.comment && (
                <div className="pl-16">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{r.comment}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pl-16 mt-4 flex items-center gap-3">
                <button className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Helpful</span>
                </button>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}


