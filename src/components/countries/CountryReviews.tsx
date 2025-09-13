'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'

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
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Unexpected error')
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
    } catch (e: any) {
      setError(e?.message || 'Unexpected error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-2 text-sm text-gray-700">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {avgRating ? avgRating.toFixed(1) : '—'} ({list.length})
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              type="button"
              className="p-1"
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(n)}
            >
              <Star className={`h-5 w-5 ${displayStars >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
          <span className="text-xs text-gray-500 ml-2">{displayStars || 0}/5</span>
        </div>
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Yorumunuzu yazın (opsiyonel)"
          className="min-h-[80px]"
        />
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm" onClick={submit} disabled={submitting}>{submitting ? 'Kaydediliyor...' : 'Gönder'}</Button>
          {!userId && <span className="text-xs text-gray-400">Yorum yapmak için giriş yapın</span>}
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      </div>

      <div className="space-y-3">
        {loading && <div className="text-sm text-gray-500">Yükleniyor...</div>}
        {!loading && list.length === 0 && (
          <div className="text-sm text-gray-500">Henüz yorum yok.</div>
        )}
        {list.map(r => (
          <div key={r.id} className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              {[1,2,3,4,5].map(n => (
                <Star key={n} className={`h-3.5 w-3.5 ${r.rating >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
              <span className="text-xs text-gray-400 ml-1">{new Date(r.created_at).toLocaleDateString()}</span>
              <span className="text-xs text-gray-500 ml-2">
                {profiles[r.user_id]?.full_name || profiles[r.user_id]?.username || 'Kullanıcı'}
              </span>
            </div>
            {r.comment && <div className="mt-2 text-sm text-gray-700">{r.comment}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}


