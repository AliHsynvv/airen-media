'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Article } from '@/types/article'
import { mockArticles } from '@/lib/data/mock-articles'

interface UseArticlesOptions {
  type?: 'article' | 'news' | 'guide'
  status?: 'draft' | 'published' | 'archived'
  limit?: number
  fallbackToMock?: boolean
}

interface UseArticlesResult {
  data: Article[]
  loading: boolean
  error: string | null
}

export function useArticles(options: UseArticlesOptions = {}): UseArticlesResult {
  const { type, status = 'published', limit = 100, fallbackToMock = true } = options
  const [data, setData] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)
        // Prefer server API for caching and reduced client latency
        const params = new URLSearchParams()
        if (type) params.set('type', type)
        if (status) params.set('status', status)
        params.set('limit', String(limit))
        const res = await fetch('/api/news', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'fetch failed')
        if (mounted) {
          const data = json.data as any[]
          const normalized = data?.map(a => ({
            ...a,
            tags: Array.isArray(a.article_tags)
              ? a.article_tags.map((at: any) => at?.tags).filter(Boolean)
              : [],
          })) as Article[] | undefined
          setData(normalized || [])
        }
      } catch (err: any) {
        console.warn('Supabase articles fetch failed:', err?.message)
        if (mounted) {
          if (fallbackToMock) {
            const fallback = type ? mockArticles.filter(a => a.type === type) : mockArticles
            setData(fallback)
            setError(null)
          } else {
            setData([])
            setError(err?.message || 'fetch_failed')
          }
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


