'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bookmark, BookmarkCheck, Heart, MessageCircle, Share2, Eye, Sparkles, HeartHandshake } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

interface Props {
  countryId: string
  countrySlug?: string
  className?: string
}

export default function CountryCardActions({ countryId, countrySlug, className }: Props) {
  const t = useTranslations('countries.actions')
  const [userId, setUserId] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [counts, setCounts] = useState({ likes: 0, comments: 0, bookmarks: 0, views: 0 })
  const [busy, setBusy] = useState(false)
  const isUuid = useMemo(() => typeof countryId === 'string' && /^[0-9a-fA-F-]{36}$/.test(countryId), [countryId])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth.user?.id ?? null
      if (!mounted) return
      setUserId(uid)

      // For demo (non-UUID) just skip querying
      if (!isUuid) return

      // per-user states
      if (uid) {
        const [{ data: bmk }, { data: fav }] = await Promise.all([
          supabase.from('country_bookmarks').select('id').eq('country_id', countryId).eq('user_id', uid).maybeSingle(),
          supabase.from('country_favorites').select('id').eq('country_id', countryId).eq('user_id', uid).maybeSingle(),
        ])
        if (!mounted) return
        setBookmarked(!!bmk)
        setFavorited(!!fav)
      } else {
        setBookmarked(false)
        setFavorited(false)
      }

      // counts
      const [likesRes, commentsRes, bookmarksRes, viewsRes] = await Promise.all([
        supabase.from('country_favorites').select('id', { count: 'exact', head: true }).eq('country_id', countryId),
        supabase.from('country_reviews').select('id', { count: 'exact', head: true }).eq('country_id', countryId),
        supabase.from('country_bookmarks').select('id', { count: 'exact', head: true }).eq('country_id', countryId),
        supabase.from('country_views').select('id', { count: 'exact', head: true }).eq('country_id', countryId),
      ])
      if (!mounted) return
      setCounts({
        likes: likesRes.count || 0,
        comments: commentsRes.count || 0,
        bookmarks: bookmarksRes.count || 0,
        views: viewsRes.count || 0,
      })
    }
    load()
    return () => { mounted = false }
  }, [countryId, isUuid])

  const ensureAuthOrRedirect = async () => {
    if (!userId) {
      window.location.href = '/auth/login'
      return false
    }
    return true
  }

  const toggleBookmark = async () => {
    if (!isUuid) { alert(t('demoData')); return }
    if (!(await ensureAuthOrRedirect())) return
    setBusy(true)
    try {
      if (bookmarked) {
        await supabase.from('country_bookmarks').delete().eq('country_id', countryId).eq('user_id', userId!)
        setBookmarked(false)
        setCounts(prev => ({ ...prev, bookmarks: Math.max(0, prev.bookmarks - 1) }))
      } else {
        await supabase.from('country_bookmarks').insert({ country_id: countryId, user_id: userId! })
        setBookmarked(true)
        setCounts(prev => ({ ...prev, bookmarks: prev.bookmarks + 1 }))
      }
    } finally {
      setBusy(false)
    }
  }

  const toggleFavorite = async () => {
    if (!isUuid) { alert(t('demoData')); return }
    if (!(await ensureAuthOrRedirect())) return
    setBusy(true)
    try {
      if (favorited) {
        await supabase.from('country_favorites').delete().eq('country_id', countryId).eq('user_id', userId!)
        setFavorited(false)
        setCounts(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }))
      } else {
        await supabase.from('country_favorites').insert({ country_id: countryId, user_id: userId! })
        setFavorited(true)
        setCounts(prev => ({ ...prev, likes: prev.likes + 1 }))
      }
    } finally {
      setBusy(false)
    }
  }

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.origin + `/countries/${countrySlug || countryId}` : ''
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Airen', url })
      } else {
        await navigator.clipboard.writeText(url)
        alert(t('linkCopied'))
      }
    } catch {}
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {/* Favorite Button */}
        <button 
          onClick={toggleFavorite} 
          disabled={busy || !isUuid}
          className={`group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
            favorited 
              ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
          }`}
        >
          <Heart className={`h-4 w-4 transition-all ${favorited ? 'fill-white text-white scale-110' : 'group-hover:text-pink-500'}`} />
          <span className="font-semibold">{counts.likes}</span>
          {favorited && <Sparkles className="h-3 w-3 animate-pulse" />}
        </button>

        {/* Bookmark Button */}
        <button 
          onClick={toggleBookmark} 
          disabled={busy || !isUuid}
          className={`group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
            bookmarked 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-white" />
          ) : (
            <Bookmark className="h-4 w-4 group-hover:text-blue-500" />
          )}
          <span className="font-semibold">{bookmarked ? 'Saved' : 'Save'}</span>
        </button>

        {/* Comments Count */}
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 text-gray-700">
          <MessageCircle className="h-4 w-4 text-purple-600" />
          <span className="font-semibold">{counts.comments}</span>
          <span className="text-xs text-gray-500">Reviews</span>
        </div>

        {/* Views Count */}
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 text-gray-700">
          <Eye className="h-4 w-4 text-gray-600" />
          <span className="font-semibold">{counts.views}</span>
          <span className="text-xs text-gray-500">Views</span>
        </div>

        {/* Share Button */}
        <button 
          onClick={share}
          className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          <Share2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}


