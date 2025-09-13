'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Bookmark, BookmarkCheck, Heart, Share2 } from 'lucide-react'

interface CountryActionsProps {
  countryId: string
  countryName?: string
  className?: string
}

export default function CountryActions({ countryId, countryName, className }: CountryActionsProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [busy, setBusy] = useState(false)
  const isUuid = typeof countryId === 'string' && /^[0-9a-fA-F-]{36}$/.test(countryId)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!isUuid) {
        // Mock data (non-uuid ids) → do not query Supabase
        setBookmarked(false)
        setFavorited(false)
        return
      }
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      if (!mounted) return
      setUserId(uid)

      if (!uid) {
        setBookmarked(false)
        setFavorited(false)
        return
      }

      const { data: bmk } = await supabase
        .from('country_bookmarks')
        .select('id')
        .eq('country_id', countryId)
        .eq('user_id', uid)
        .maybeSingle()
      if (mounted) setBookmarked(!!bmk)

      const { data: fav } = await supabase
        .from('country_favorites')
        .select('id')
        .eq('country_id', countryId)
        .eq('user_id', uid)
        .maybeSingle()
      if (mounted) setFavorited(!!fav)
    }
    load()
    return () => { mounted = false }
  }, [countryId])

  const ensureAuthOrRedirect = async () => {
    if (!userId) {
      window.location.href = '/auth/login'
      return false
    }
    return true
  }

  const toggleBookmark = async () => {
    if (!isUuid) { alert('Bu ülke demo verisi. Girişimler Supabase üzerinde kaydedilmez.'); return }
    if (!(await ensureAuthOrRedirect())) return
    setBusy(true)
    try {
      if (bookmarked) {
        await supabase
          .from('country_bookmarks')
          .delete()
          .eq('country_id', countryId)
          .eq('user_id', userId!)
        setBookmarked(false)
      } else {
        await supabase
          .from('country_bookmarks')
          .insert({ country_id: countryId, user_id: userId! })
        setBookmarked(true)
      }
    } finally {
      setBusy(false)
    }
  }

  const toggleFavorite = async () => {
    if (!isUuid) { alert('Bu ülke demo verisi. Girişimler Supabase üzerinde kaydedilmez.'); return }
    if (!(await ensureAuthOrRedirect())) return
    setBusy(true)
    try {
      if (favorited) {
        await supabase
          .from('country_favorites')
          .delete()
          .eq('country_id', countryId)
          .eq('user_id', userId!)
        setFavorited(false)
      } else {
        await supabase
          .from('country_favorites')
          .insert({ country_id: countryId, user_id: userId! })
        setFavorited(true)
      }
    } finally {
      setBusy(false)
    }
  }

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) {
        await navigator.share({ title: countryName || 'Airen', url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Bağlantı kopyalandı!')
      }
    } catch (_) {}
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={toggleBookmark}
          disabled={busy || !isUuid}
          className="h-9 px-3 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
        >
          {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {bookmarked ? 'Kaydedildi' : 'Kaydet'}
        </button>
        <button
          onClick={toggleFavorite}
          disabled={busy || !isUuid}
          className={`h-9 px-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center gap-1 ${favorited ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-700'}`}
        >
          <Heart className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
          {favorited ? 'Favorited' : 'Add to Favorites'}
        </button>
        <button
          onClick={share}
          className="h-9 px-3 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
        >
          <Share2 className="h-4 w-4" /> Share Country
        </button>
      </div>
    </div>
  )
}


