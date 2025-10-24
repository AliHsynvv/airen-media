'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bookmark, BookmarkCheck, Heart, MessageCircle, Share2, Eye } from 'lucide-react'
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
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="inline-flex items-center gap-2">
          <button onClick={toggleFavorite} disabled={busy || !isUuid} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${favorited ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-700 border-gray-200 bg-white'} hover:bg-gray-50`}>
            <Heart className={`h-3.5 w-3.5 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{counts.likes}</span>
          </button>
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-700">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{counts.comments}</span>
          </div>
          <button onClick={toggleBookmark} disabled={busy || !isUuid} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
            {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span>{counts.bookmarks}</span>
          </button>
        </div>
        <div className="inline-flex items-center gap-2">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-700">
            <Eye className="h-3.5 w-3.5" />
            <span>{counts.views}</span>
          </div>
          <button onClick={share} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
            <Share2 className="h-3.5 w-3.5" />
            <span>{t('shareCountry')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}


