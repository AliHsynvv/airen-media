'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Filter, Grid, List, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MediaCard } from '@/components/media/MediaCard'
import { supabase } from '@/lib/supabase/client'
import type { Media } from '@/types/media'

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'duration'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [videos, setVideos] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('media')
          .select('*')
          .eq('type', 'video')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(500)
        if (error) throw error
        if (mounted) setVideos((data as any) || [])
      } catch {
        if (mounted) setVideos([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const filteredVideos = useMemo(() => {
    const arr = videos.filter(video => {
      const matchesSearch = searchQuery === '' || 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === null || 
        video.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    if (sortBy === 'newest') {
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'popular') {
      arr.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    } else if (sortBy === 'duration') {
      arr.sort((a, b) => (b.duration || 0) - (a.duration || 0))
    }

    return arr
  }, [videos, searchQuery, selectedCategory, sortBy])

  const videoCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>()
    for (const v of videos) {
      if (!v.category) continue
      const cur = map.get(v.category)
      if (cur) cur.count += 1
      else map.set(v.category, { id: v.category, name: v.category, count: 1 })
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [videos])

  const mostViewed = useMemo(() => videos.slice().sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0], [videos])

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="airen-gradient-text">Airen Videoları</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Dünya çapında seyahat deneyimleri, şehir sunumları ve kültürel keşifler
          </p>
        </div>

        {/* Stats Bar */}
        <div className="glass-card p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <h3 className="text-2xl font-bold text-airen-neon-blue mb-1">
                {videos.length}
              </h3>
              <p className="text-gray-300 text-sm">Video</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-airen-neon-green mb-1">
                {videos.reduce((acc, v) => acc + (v.view_count || 0), 0).toLocaleString()}
              </h3>
              <p className="text-gray-300 text-sm">Toplam İzlenme</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-airen-neon-purple mb-1">
                {Math.round(videos.reduce((acc, v) => acc + (v.duration || 0), 0) / 60)}
              </h3>
              <p className="text-gray-300 text-sm">Dakika İçerik</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-400 mb-1">
                {videos.reduce((acc, v) => acc + (v.like_count || 0), 0).toLocaleString()}
              </h3>
              <p className="text-gray-300 text-sm">Beğeni</p>
            </div>
          </div>
        </div>

        {/* Featured Video */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 text-airen-neon-blue mr-2" />
            En Popüler Video
          </h2>
          {mostViewed && <MediaCard media={mostViewed} variant="featured" />}
        </section>

        {/* Filters and Search */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Video ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-airen-dark-2 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <Button
                variant={sortBy === 'newest' ? 'neon' : 'glass'}
                size="sm"
                onClick={() => setSortBy('newest')}
              >
                <Clock className="h-4 w-4 mr-1" />
                En Yeni
              </Button>
              <Button
                variant={sortBy === 'popular' ? 'neon' : 'glass'}
                size="sm"
                onClick={() => setSortBy('popular')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Popüler
              </Button>
              <Button
                variant={sortBy === 'duration' ? 'neon' : 'glass'}
                size="sm"
                onClick={() => setSortBy('duration')}
              >
                <Clock className="h-4 w-4 mr-1" />
                Uzun
              </Button>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'neon' : 'glass'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'neon' : 'glass'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={selectedCategory === null ? 'neon' : 'glass'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Tümü ({videos.length})
            </Button>
            {videoCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'neon' : 'glass'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            {filteredVideos.length} video bulundu
            {selectedCategory && (
              <span className="ml-2">
                • {videoCategories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
          </p>
          
          {(searchQuery || selectedCategory) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
              className="text-gray-400 hover:text-white"
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>

        {/* Videos Grid/List */}
        {loading ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
              : 'space-y-6'
          }>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 h-40 animate-pulse" />
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
              : 'space-y-6'
          }>
            {filteredVideos.map((video) => (
              <MediaCard
                key={video.id}
                media={video}
                variant={viewMode === 'list' ? 'compact' : 'default'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full glass-card flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Video Bulunamadı
            </h3>
            <p className="text-gray-400 mb-6">
              Arama kriterlerinizi değiştirerek tekrar deneyin
            </p>
            <Button
              variant="neon"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
            >
              Tüm Videoları Göster
            </Button>
          </div>
        )}

        {/* Categories Sidebar */}
        <aside className="mt-16">
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text_WHITE mb-4">
                Video Kategorileri
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {videoCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant="glass"
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex flex-col items-center p-4 h-auto space-y-2 hover:airen-glow transition-all"
                  >
                    <span className="text-xs">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
