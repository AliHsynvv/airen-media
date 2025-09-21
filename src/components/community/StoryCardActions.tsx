'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Heart, MessageSquare, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

export type StoryCardActionsProps = {
  storyId: string
  initialLikes: number
  initialComments?: number
  storySlug?: string | null
  storyTitle?: string
  className?: string
  initialShares?: number
  onComment?: () => void
}

export default function StoryCardActions({ storyId, initialLikes, initialComments = 0, storySlug, storyTitle, className, initialShares = 0, onComment }: StoryCardActionsProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shares, setShares] = useState<number>(initialShares)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      const { data: u } = await supabase.auth.getUser()
      const userId = u.user?.id
      // load count via API to avoid RLS/head flakiness
      const res = await fetch(`/api/community/stories/like?storyId=${encodeURIComponent(storyId)}`)
      const json = await res.json().catch(() => ({}))
      if (mounted && json?.success) setLikes(json.data?.count || 0)
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
        const res = await fetch('/api/community/stories/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyId }),
        })
        if (!res.ok) { setLiked(false); setLikes(v => Math.max(0, v - 1)) }
        try {
          // notify story owner about like
          const { data: story } = await supabase.from('user_stories').select('user_id').eq('id', storyId).single()
          if (story?.user_id && story.user_id !== userId) {
            await supabase.from('notifications').insert({ user_id: story.user_id, type: 'story_like', payload: { story_id: storyId, liker_id: userId } })
          }
        } catch {}
        // refresh count from server to be exact
        const countRes = await fetch(`/api/community/stories/like?storyId=${encodeURIComponent(storyId)}`)
        const j = await countRes.json().catch(() => ({}))
        if (j?.success) setLikes(j.data?.count || 0)
      } else {
        setLiked(false); setLikes(v => Math.max(0, v - 1))
        const res = await fetch('/api/community/stories/like', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyId }),
        })
        if (!res.ok) { setLiked(true); setLikes(v => v + 1) }
        // refresh count from server
        const countRes = await fetch(`/api/community/stories/like?storyId=${encodeURIComponent(storyId)}`)
        const j = await countRes.json().catch(() => ({}))
        if (j?.success) setLikes(j.data?.count || 0)
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
      // optimistic UI update for share count
      setShares(v => v + 1)
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

  const items = [
    { key: 'like' as const, onClick: toggleLike, Icon: Heart },
    { key: 'comment' as const, onClick: onComment || goComments, Icon: MessageSquare },
    { key: 'share' as const, onClick: share, Icon: Share2 },
    { key: 'save' as const, onClick: save, Icon: Bookmark },
  ]

  return (
    <div
      className={cn(
        'mt-auto border-t border-gray-200/70 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60',
        className
      )}
    >
      <div className="grid grid-cols-4">
        {items.map(({ key, onClick, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={onClick}
            className={cn(
              'group flex items-center justify-center gap-2 py-3 min-h-11 rounded-md text-gray-600 hover:text-gray-900 transition-colors duration-150 ease-in-out',
              key === 'like' && liked ? 'text-red-600 bg-red-50 hover:text-red-700' : '',
              key === 'save' && saved ? 'text-blue-700 bg-blue-50 hover:text-blue-800' : '',
              key === 'like' ? 'hover:bg-red-50' : key === 'save' ? 'hover:bg-blue-50' : 'hover:bg-gray-50'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 transition-transform duration-150 ease-in-out group-hover:scale-110',
                key === 'like' && liked ? 'fill-red-600' : key === 'save' && saved ? 'fill-blue-700' : 'fill-transparent'
              )}
            />
            <span className="text-sm font-medium">
              {key === 'like'
                ? likes.toLocaleString()
                : key === 'comment'
                ? initialComments?.toLocaleString?.() ?? 0
                : key === 'share'
                ? shares.toLocaleString()
                : ''}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}


