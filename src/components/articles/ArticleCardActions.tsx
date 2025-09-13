'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { BookmarkPlus, BookmarkCheck, Share2, Eye } from 'lucide-react'

interface ArticleCardActionsProps {
  articleId: string
  articleTitle?: string
  initialViews?: number
  theme?: 'dark' | 'light'
}

export default function ArticleCardActions({ articleId, articleTitle, initialViews = 0, theme = 'light' }: ArticleCardActionsProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [views, setViews] = useState<number>(initialViews)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const uid = data.user?.id ?? null
      if (!mounted) return
      setUserId(uid)
      if (!uid) { setSaved(false); return }
      const { data: row } = await supabase
        .from('article_bookmarks')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', uid)
        .maybeSingle()
      if (mounted) setSaved(!!row)
    }
    load()
    return () => { mounted = false }
  }, [articleId])

  const toggleSave = async () => {
    if (!userId) { window.location.href = '/auth/login'; return }
    setBusy(true)
    try {
      if (saved) {
        await supabase.from('article_bookmarks').delete().eq('article_id', articleId).eq('user_id', userId)
        setSaved(false)
      } else {
        await supabase.from('article_bookmarks').insert({ article_id: articleId, user_id: userId })
        setSaved(true)
      }
    } finally {
      setBusy(false)
    }
  }

  const share = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/articles/${articleId}` : ''
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
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
        <Eye className="h-3.5 w-3.5" /> {views.toLocaleString()}
      </span>
      <Button size="sm" variant="secondary" className={`h-8 px-2 ${theme === 'light' ? 'border border-gray-200 bg-white text-black hover:bg-gray-50' : ''}`} onClick={share}>
        <Share2 className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="secondary" className={`h-8 px-2 ${theme === 'light' ? 'border border-gray-200 bg-white text-black hover:bg-gray-50' : ''}`} onClick={toggleSave} disabled={busy}>
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
      </Button>
    </div>
  )
}


