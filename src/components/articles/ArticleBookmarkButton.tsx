'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { BookmarkPlus, BookmarkCheck } from 'lucide-react'

interface ArticleBookmarkButtonProps {
  articleId: string
  className?: string
}

export default function ArticleBookmarkButton({ articleId, className }: ArticleBookmarkButtonProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data: u } = await supabase.auth.getUser()
      const uid = u.user?.id ?? null
      if (!mounted) return
      setUserId(uid)
      if (!uid) { setSaved(false); return }
      const { data } = await supabase
        .from('article_bookmarks')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', uid)
        .maybeSingle()
      if (mounted) setSaved(!!data)
    }
    load()
    return () => { mounted = false }
  }, [articleId])

  const toggle = async () => {
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

  return (
    <Button
      onClick={toggle}
      disabled={busy}
      variant="secondary"
      size="sm"
      className={`border border-gray-200 bg-white text-black hover:bg-gray-50 ${className || ''}`}
    >
      {saved ? <BookmarkCheck className="h-4 w-4 mr-2 text-black" /> : <BookmarkPlus className="h-4 w-4 mr-2 text-black" />}
      {saved ? 'Kaydedildi' : 'Kaydet'}
    </Button>
  )
}


