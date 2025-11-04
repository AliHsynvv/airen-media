'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Video, Upload, RefreshCw, Play, Eye, Trash2, Download } from 'lucide-react'

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

  const totalMedia = photos.length + videos.length
  const hasNoMedia = !loading && totalMedia === 0

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{photos.length}</div>
              <div className="text-xs text-gray-600">Photos</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-200/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{videos.length}</div>
              <div className="text-xs text-gray-600">Videos</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          {error}
        </div>
      )}

      {/* Empty State - Show when no media */}
      {hasNoMedia && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border-2 border-dashed border-gray-300 p-12 text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100 to-orange-100 rounded-full blur-3xl opacity-20 -ml-32 -mb-32"></div>
          
          <div className="relative">
            <div className="inline-flex items-center justify-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <ImageIcon className="h-8 w-8 text-white" />
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Video className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Media Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building your media gallery by uploading photos and videos of your business
            </p>
            
            <button
              onClick={openUploader}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Upload className="h-5 w-5" />
              Upload Your First Media
            </button>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">Supported formats</p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                <span className="px-3 py-1 rounded-full bg-gray-100 font-medium">JPG</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 font-medium">PNG</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 font-medium">WebP</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 font-medium">MP4</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 font-medium">WebM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photos Section */}
      {!hasNoMedia && (
        <>
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Photos</h2>
                <span className="text-sm text-gray-500">({photos.length})</span>
              </div>
              <button
                onClick={load}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map(m => (
                  <div key={m.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                        <button className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                          <Eye className="h-4 w-4 text-gray-900" />
                        </button>
                        <button className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                          <Download className="h-4 w-4 text-gray-900" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No photos yet</p>
              </div>
            )}
          </section>

          {/* Videos Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Videos</h2>
                <span className="text-sm text-gray-500">({videos.length})</span>
              </div>
            </div>
            {videos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {videos.map(m => (
                  <div key={m.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300">
                    <video src={m.url} className="h-full w-full object-cover" muted />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Play className="h-6 w-6 text-gray-900 ml-1" />
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center justify-between">
                        <button className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                          <Eye className="h-4 w-4 text-gray-900" />
                        </button>
                        <button className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                          <Download className="h-4 w-4 text-gray-900" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No videos yet</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}


