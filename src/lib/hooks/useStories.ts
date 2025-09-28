'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { UserStory } from '@/types/story'

interface UseStoriesResult {
  data: UserStory[]
  loading: boolean
  error: string | null
}

export function useStories(): UseStoriesResult {
  const [data, setData] = useState<UserStory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchStories = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/community/stories', { cache: 'force-cache' })
        const json: { success: boolean; data: unknown; error?: string } = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'fetch failed')
        if (mounted) setData((json.data as UserStory[]) || [])
      } catch (err: unknown) {
        if (mounted) setData([])
        if (mounted) setError(err instanceof Error ? err.message : 'fetch_failed')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchStories()
    return () => { mounted = false }
  }, [])

  return { data, loading, error }
}


