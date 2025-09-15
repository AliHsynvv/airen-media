'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Heart, MessageSquare, Share2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Props = {
  storyId: string
  initialLikes: number
  initialComments?: number
  storySlug?: string | null
  storyTitle?: string
}

export default function StoryCardActions({ storyId, initialLikes, initialComments = 0, storySlug, storyTitle }: Props) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      const { data: u } = await supabase.auth.getUser()
      const userId = u.user?.id
      if (!userId) { if (mounted) setLiked(false); return }
      const { data } = await supabase
        .from('story_likes')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', userId)
        .maybeSingle()
      if (mounted) setLiked(!!data)
      // check saved
      const { data: s } = await supabase
        .from('story_saves')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', userId)
        .maybeSingle()
      if (mounted) setSaved(!!s)
    }
    check()
    return () => { mounted = false }
  }, [storyId])

  const toggleLike = async () => {
    if (loading) return
    setLoading(true)
    try {
      const { data: u } = await supabase.auth.getUser()
      const userId = u.user?.id
      if (!userId) {
        alert('Beğenmek için lütfen giriş yapın.')
        window.location.href = '/auth/login'
        return
      }
      if (!liked) {
        setLiked(true); setLikes(v => v + 1)
        const { error } = await supabase.from('story_likes').insert({ story_id: storyId, user_id: userId })
        if (error) { setLiked(false); setLikes(v => Math.max(0, v - 1)) }
      } else {
        setLiked(false); setLikes(v => Math.max(0, v - 1))
        const { error } = await supabase.from('story_likes').delete().eq('story_id', storyId).eq('user_id', userId)
        if (error) { setLiked(true); setLikes(v => v + 1) }
      }
    } finally {
      setLoading(false)
    }
  }

  const share = async () => {
    const url = storySlug ? `${window.location.origin}/community/stories/${storySlug}` : window.location.href
    const title = storyTitle || 'Airen Story'
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link panoya kopyalandı')
      }
    } catch {}
  }

  const save = async () => {
    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (!userId) { window.location.href = '/auth/login'; return }
    if (!saved) {
      setSaved(true)
      const { error } = await supabase.from('story_saves').insert({ story_id: storyId, user_id: userId })
      if (error) setSaved(false)
    } else {
      setSaved(false)
      const { error } = await supabase.from('story_saves').delete().eq('story_id', storyId).eq('user_id', userId)
      if (error) setSaved(true)
    }
  }

  const goComments = () => {
    if (storySlug) {
      window.location.href = `/community/stories/${storySlug}#comments`
    } else if (storyId) {
      window.location.href = `/community` // fallback
    }
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={liked ? 'Beğenmekten vazgeç' : 'Beğen'}
            onClick={toggleLike}
            className={`group min-h-11 text-gray-600 ${liked ? 'text-red-600' : ''}`}
          >
            <span className="inline-flex items-center gap-2">
              <Heart className={`h-6 w-6 ${liked ? 'fill-red-600' : 'fill-transparent'} transition-transform group-active:scale-95`} />
              <span className="hidden sm:inline text-sm">Beğen</span>
              <span className="text-sm tabular-nums">{likes.toLocaleString()}</span>
            </span>
          </button>
          <button type="button" aria-label="Yorumlar" onClick={goComments} className="group min-h-11 text-gray-600 hover:text-gray-900">
            <span className="inline-flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              <span className="hidden sm:inline text-sm">Yorum</span>
              <span className="text-sm tabular-nums">{initialComments?.toLocaleString?.() ?? 0}</span>
            </span>
          </button>
          <button type="button" aria-label="Paylaş" onClick={share} className="group min-h-11 text-gray-600 hover:text-gray-900">
            <span className="inline-flex items-center gap-2">
              <Share2 className="h-6 w-6" />
              <span className="hidden sm:inline text-sm">Paylaş</span>
            </span>
          </button>
        </div>
        <button type="button" aria-label={saved ? 'Kaydedildi' : 'Kaydet'} onClick={save} className={`group min-h-11 ${saved ? 'text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}>
          <span className="inline-flex items-center gap-2">
            <Bookmark className={`h-6 w-6 ${saved ? 'fill-blue-700' : 'fill-transparent'}`} />
            <span className="hidden sm:inline text-sm">Kaydet</span>
          </span>
        </button>
      </div>
      {/* Remove duplicate likes line; counts shown inline */}
    </div>
  )
}


