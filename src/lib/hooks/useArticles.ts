'use client'

import { useEffect, useState } from 'react'
// import { supabase } from '@/lib/supabase/client'
import { Article } from '@/types/article'

interface UseArticlesOptions {
  type?: 'article' | 'news' | 'guide'
  status?: 'draft' | 'published' | 'archived'
  limit?: number
}

interface UseArticlesResult {
  data: Article[]
  loading: boolean
  error: string | null
}

export function useArticles(options: UseArticlesOptions = {}): UseArticlesResult {
  const { type, status = 'published', limit = 100 } = options
  const [data, setData] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams()
        if (type) params.set('type', type)
        if (status) params.set('status', status)
        params.set('limit', String(limit))
        const res = await fetch(`/api/news?${params.toString()}`, { cache: 'force-cache' })
        const json: { success: boolean; data: unknown; error?: string } = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'fetch failed')
        if (mounted) {
          type ServerTag = { tags?: { slug: string; name: string } | null }
          type ServerArticle = Article & { article_tags?: ServerTag[] }
          const arr = Array.isArray(json.data) ? (json.data as ServerArticle[]) : []
          const normalized: Article[] = arr.map((a) => ({
            ...a,
            tags: Array.isArray(a.article_tags)
              ? a.article_tags.map((at) => at.tags).filter(Boolean) as Article['tags']
              : [],
          }))
          setData(normalized)
        }
      } catch (err: unknown) {
        if (mounted) {
          setData([])
          setError(err instanceof Error ? err.message : 'fetch_failed')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchArticles()
    return () => {
      mounted = false
    }
  }, [type, status, limit])

  return { data, loading, error }
}


