'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ArticleViewsProps {
  articleId: string
  initial?: number
  className?: string
}

export default function ArticleViews({ articleId, initial = 0, className }: ArticleViewsProps) {
  const [views, setViews] = useState<number>(initial || 0)

  useEffect(() => {
    let mounted = true

    const fetchViews = async () => {
      const { data } = await supabase
        .from('articles')
        .select('view_count')
        .eq('id', articleId)
        .single()
      if (mounted) setViews(data?.view_count ?? initial ?? 0)
    }

    // Fetch immediately and refetch shortly after to reflect API increment
    fetchViews()
    const t = setTimeout(fetchViews, 800)

    // Optional: periodic refresh while on page
    const interval = setInterval(fetchViews, 15000)

    return () => { mounted = false; clearTimeout(t); clearInterval(interval) }
  }, [articleId, initial])

  return <span className={className}>{views.toLocaleString()} görüntülenme</span>
}


