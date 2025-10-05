'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type BizMedia = {
  id: string
  url: string
  media_type: 'image' | 'video'
  created_at: string
}

export default function BusinessMediaGrid({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<BizMedia[]>([])
  const [videos, setVideos] = useState<BizMedia[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('business_media')
        .select('id,url,media_type,created_at')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      const p: BizMedia[] = []
      const v: BizMedia[] = []
      for (const m of (data || []) as BizMedia[]) {
        if (m.media_type === 'video') v.push(m); else p.push(m)
      }
      setPhotos(p)
      setVideos(v)
    } catch (e: any) {
      setError(e?.message || 'Yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [businessId])

  const openUploader = () => { if (typeof window !== 'undefined') window.location.hash = '#upload-media' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Media</h1>
          <p className="text-sm text-gray-600">Manage your photos and videos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openUploader} className="rounded-full">Upload Media</Button>
          <Button variant="outline" onClick={load}>Refresh</Button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <section>
        <h2 className="font-semibold mb-2">Photos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map(m => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.url} alt="" className="rounded-2xl h-28 sm:h-32 w-full object-cover" />
          ))}
          {!loading && photos.length === 0 && <div className="text-sm text-gray-500">No photos yet.</div>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Videos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {videos.map(m => (
            <video key={m.id} src={m.url} className="rounded-2xl h-28 sm:h-32 w-full object-cover" controls={false} muted />
          ))}
          {!loading && videos.length === 0 && <div className="text-sm text-gray-500">No videos yet.</div>}
        </div>
      </section>
    </div>
  )
}


