'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Country } from '@/types/country'

interface UseCountriesResult {
  data: Country[]
  loading: boolean
  error: string | null
}

export function useCountries(): UseCountriesResult {
  const [data, setData] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const ac = new AbortController()
    const fetchCountries = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data, error } = await supabase
          .from('countries')
          .select('id,slug,name,capital,featured_image,iso_code,average_budget,popular_activities,top_places,featured,best_time_to_visit,climate_info,trending_score,culture_description,culture_description_i18n,best_time_to_visit_i18n,climate_info_i18n')
          .order('name', { ascending: true })
          .limit(60)
        if (error) throw error
        if (mounted) setData((data as Country[]) || [])
      } catch (err: unknown) {
        console.warn('Supabase countries fetch failed:', err)
        if (mounted) setData([])
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load countries')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchCountries()
    return () => {
      mounted = false
      ac.abort()
    }
  }, [])

  return { data, loading, error }
}


