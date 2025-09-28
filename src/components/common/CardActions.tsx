'use client'

import { useEffect, useRef, useState } from 'react'
import { Eye, MessageSquare, Share2, Bookmark, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

type CardActionsProps = {
  views?: number
  comments?: number
  // Story like support
  showViews?: boolean
  likes?: number
  liked?: boolean
  articleId?: string
  articleSlug?: string
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onSave?: () => void
  saved?: boolean
  hideLabels?: boolean
  className?: string
}

export default function CardActions({
  views = 0,
  comments = 0,
  showViews = true,
  likes = 0,
  liked = false,
  articleId,
  articleSlug,
  onLike,
  onComment,
  onShare,
  onSave,
  saved = false,
  hideLabels = true,
  className,
}: CardActionsProps) {
  const [likeCount, setLikeCount] = useState<number>(likes)
  const [isLiked, setIsLiked] = useState<boolean>(liked)
  const [busy, setBusy] = useState(false)
  const [isSaved, setIsSaved] = useState<boolean>(saved)
  const [busySave, setBusySave] = useState(false)
  const hasInteractedRef = useRef(false)

  // Keep like count in sync with provided prop (from server) without clobbering user interaction
  useEffect(() => {
    if (typeof likes === 'number' && !hasInteractedRef.current) {
      setLikeCount(likes)
    }
  }, [likes])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!articleId) return
      const userRes = await supabase.auth.getUser()
      const uid = userRes.data.user?.id ?? null
      // Only fetch total like count if not provided via props
      if (typeof likes !== 'number') {
        const { count } = await supabase
          .from('article_likes')
          .select('*', { count: 'exact', head: true })
          .eq('article_id', articleId)
        if (mounted && !hasInteractedRef.current) setLikeCount(count || 0)
      }

      if (uid) {
        const { data } = await supabase
          .from('article_likes')
          .select('id')
          .eq('article_id', articleId)
          .eq('user_id', uid)
          .maybeSingle()
        if (mounted && !hasInteractedRef.current) setIsLiked(!!data)
        // load saved state
        const { data: b } = await supabase
          .from('article_bookmarks')
          .select('id')
          .eq('article_id', articleId)
          .eq('user_id', uid)
          .maybeSingle()
        if (mounted && !hasInteractedRef.current) setIsSaved(!!b)
      } else {
        if (mounted && !hasInteractedRef.current) { setIsLiked(false); setIsSaved(false) }
      }
    }
    load()
    return () => { mounted = false }
  }, [articleId, likes])

  const handleLike = async () => {
    if (onLike) return onLike()
    if (!articleId || busy) return
    hasInteractedRef.current = true
    setBusy(true)
    try {
      const userRes = await supabase.auth.getUser()
      const uid = userRes.data.user?.id
      if (!uid) { window.location.href = '/auth/login'; return }
      if (isLiked) {
        setIsLiked(false); setLikeCount(v => Math.max(0, v - 1))
        const { error } = await supabase.from('article_likes').delete().eq('article_id', articleId).eq('user_id', uid)
        if (error) { setIsLiked(true); setLikeCount(v => v + 1) }
      } else {
        setIsLiked(true); setLikeCount(v => v + 1)
        const { error } = await supabase
          .from('article_likes')
          .upsert({ article_id: articleId, user_id: uid }, { onConflict: 'article_id,user_id', ignoreDuplicates: true })
        if (error) { setIsLiked(false); setLikeCount(v => Math.max(0, v - 1)) }
      }
    } finally {
      setBusy(false)
    }
  }

  const handleShare = async () => {
    if (onShare) return onShare()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = articleSlug ? `${origin}/articles/${articleSlug}` : (typeof window !== 'undefined' ? window.location.href : '')
    try {
      // Prefer native share sheet when available
      if (navigator.share) {
        await navigator.share({ title: 'Airen', url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Bağlantı kopyalandı!')
      }
    } catch {}
  }

  const handleSave = async () => {
    if (onSave) return onSave()
    if (!articleId || busySave) return
    setBusySave(true)
    try {
      const userRes = await supabase.auth.getUser()
      const uid = userRes.data.user?.id
      if (!uid) { window.location.href = '/auth/login'; return }
      if (isSaved) {
        setIsSaved(false)
        const { error } = await supabase
          .from('article_bookmarks')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', uid)
        if (error) setIsSaved(true)
      } else {
        setIsSaved(true)
        const { error } = await supabase
          .from('article_bookmarks')
          .upsert({ article_id: articleId, user_id: uid }, { onConflict: 'article_id,user_id', ignoreDuplicates: true })
        if (error) setIsSaved(false)
      }
    } finally {
      setBusySave(false)
    }
  }

  const items = [
    ...(showViews ? [{ key: 'views' as const, label: 'Görüntülenme', aria: 'Görüntülenme', Icon: Eye, onClick: undefined }] : []),
    { key: 'like' as const, label: isLiked ? 'Beğenmekten vazgeç' : 'Beğen', aria: isLiked ? 'Beğenmekten vazgeç' : 'Beğen', Icon: Heart, onClick: handleLike },
    { key: 'comment' as const, label: 'Comment', aria: 'Yorum yap', Icon: MessageSquare, onClick: onComment || (() => { if (articleSlug) { window.location.href = `/articles/${articleSlug}#comments` } }) },
    { key: 'share' as const, label: 'Paylaş', aria: 'Paylaş', Icon: Share2, onClick: handleShare },
    { key: 'save' as const, label: isSaved ? 'Kaydedildi' : 'Kaydet', aria: isSaved ? 'Kaydedildi' : 'Kaydet', Icon: Bookmark, onClick: handleSave },
  ]

  return (
    <div
      className={cn(
        'mt-auto border-t border-gray-200/70 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60',
        className
      )}
    >
      <div className={cn('grid', items.length === 5 ? 'grid-cols-5' : 'grid-cols-4')}>
        {items.map(({ key, label, aria, Icon, onClick }) => (
          <button
            key={key}
            type="button"
            aria-label={aria}
            title={label}
            onClick={onClick}
            className={cn(
              'group flex items-center justify-center gap-2 py-3 min-h-11 rounded-md',
              key === 'like' && isLiked
                ? 'text-red-600 bg-red-50'
                : key === 'like'
                ? 'text-gray-600 hover:text-red-600'
                : key === 'save' && saved
                ? 'text-blue-700 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900',
              'transition-colors duration-150 ease-in-out',
              key === 'like' ? 'hover:bg-red-50' : key === 'save' ? 'hover:bg-blue-50' : 'hover:bg-gray-50',
              'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 transition-transform duration-150 ease-in-out group-hover:scale-110',
                key === 'like' && isLiked ? 'fill-red-600' : key === 'save' && isSaved ? 'fill-blue-700' : 'fill-transparent'
              )}
            />
            {!hideLabels && key !== 'share' && key !== 'save' && (
              <span className="text-sm font-medium">
                {key === 'views'
                  ? views.toLocaleString()
                  : key === 'comment'
                  ? comments.toLocaleString()
                  : key === 'like'
                  ? likeCount.toLocaleString()
                  : label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}


