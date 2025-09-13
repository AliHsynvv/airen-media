'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { UserStory } from '@/types/story'
import { mockStories } from '@/lib/data/mock-stories'

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
        const res = await fetch('/api/community/stories', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'fetch failed')
        if (mounted) setData((json.data as UserStory[]) || [])
      } catch (err: any) {
        console.warn('Supabase stories fetch failed, falling back to mocks:', err?.message)
        if (mounted) setData(mockStories)
        if (mounted) setError(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchStories()
    return () => { mounted = false }
  }, [])

  return { data, loading, error }
}


