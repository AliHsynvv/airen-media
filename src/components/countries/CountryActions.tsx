'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Bookmark, BookmarkCheck, Heart, Share2, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CountryActionsProps {
  countryId: string
  countryName?: string
  className?: string
}

export default function CountryActions({ countryId, countryName, className }: CountryActionsProps) {
  const t = useTranslations('countries.actions')
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
    if (!isUuid) { alert(t('demoData')); return }
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
    if (!isUuid) { alert(t('demoData')); return }
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
        alert(t('linkCopied'))
      }
    } catch (_) {}
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-3">
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          disabled={busy || !isUuid}
          className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
            favorited 
              ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl' 
              : 'bg-white/90 backdrop-blur-sm text-gray-700 border-2 border-white/40 hover:border-pink-300 hover:bg-white shadow-md'
          }`}
        >
          <Heart className={`h-5 w-5 transition-all ${favorited ? 'fill-white text-white scale-110' : 'group-hover:text-pink-500'}`} />
          <span>{favorited ? t('favorited') : t('addToFavorites')}</span>
          {favorited && <Sparkles className="h-4 w-4 animate-pulse" />}
        </button>

        {/* Bookmark Button */}
        <button
          onClick={toggleBookmark}
          disabled={busy || !isUuid}
          className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
            bookmarked 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl' 
              : 'bg-white/90 backdrop-blur-sm text-gray-700 border-2 border-white/40 hover:border-blue-300 hover:bg-white shadow-md'
          }`}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-5 w-5 text-white" />
          ) : (
            <Bookmark className="h-5 w-5 group-hover:text-blue-500" />
          )}
          <span>{bookmarked ? t('bookmarked') : t('bookmark')}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={share}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          <Share2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          <span>{t('shareCountry')}</span>
        </button>
      </div>
    </div>
  )
}


