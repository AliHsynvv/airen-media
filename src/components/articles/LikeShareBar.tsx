'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface LikeShareBarProps {
  articleId: string
  articleTitle?: string
}

export default function LikeShareBar({ articleId, articleTitle }: LikeShareBarProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState<number>(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const userRes = await supabase.auth.getUser()
      const uid = userRes.data.user?.id ?? null
      if (!mounted) return
      setUserId(uid)

      const { count } = await supabase
        .from('article_likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId)
      if (mounted) setCount(count || 0)

      if (uid) {
        const { data } = await supabase
          .from('article_likes')
          .select('id')
          .eq('article_id', articleId)
          .eq('user_id', uid)
          .maybeSingle()
        if (mounted) setLiked(!!data)
      } else {
        setLiked(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [articleId])

  const toggleLike = async () => {
    if (!userId) {
      window.location.href = '/auth/login'
      return
    }
    setBusy(true)
    try {
      if (liked) {
        await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', userId)
        setLiked(false)
        setCount(c => Math.max(0, c - 1))
      } else {
        await supabase
          .from('article_likes')
          .insert({ article_id: articleId, user_id: userId })
        setLiked(true)
        setCount(c => c + 1)
      }
    } finally {
      setBusy(false)
    }
  }

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) {
        await navigator.share({ title: articleTitle || 'Airen', url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Bağlantı kopyalandı!')
      }
    } catch (_) {}
  }

  return (
    <div className="flex items-center space-x-3 text-black">
      <Button variant="secondary" size="sm" onClick={toggleLike} disabled={busy} className="border border-gray-200 bg-white text-black hover:bg-gray-50">
        <Heart className={`h-4 w-4 mr-2 ${liked ? 'text-red-500' : ''}`} />
        {liked ? 'Beğenildi' : 'Beğen'} ({count})
      </Button>
      <Button variant="secondary" size="sm" onClick={share} className="border border-gray-200 bg-white text-black hover:bg-gray-50">
        <Share2 className="h-4 w-4 mr-2" />
        Paylaş
      </Button>
      {!userId && (
        <Link href="/auth/login" className="text-xs text-gray-500 hover:text-black">Giriş yap</Link>
      )}
    </div>
  )
}


