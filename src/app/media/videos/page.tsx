'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Grid, List, TrendingUp, Clock, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MediaCard } from '@/components/media/MediaCard'
import { mockVideos, mediaCategories } from '@/lib/data/mock-media'

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'duration'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredVideos = useMemo(() => {
    const videos = mockVideos.filter(video => {
      const matchesSearch = searchQuery === '' || 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === null || 
        video.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    // Sort videos
    if (sortBy === 'newest') {
      videos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'popular') {
      videos.sort((a, b) => b.view_count - a.view_count)
    } else if (sortBy === 'duration') {
      videos.sort((a, b) => (b.duration || 0) - (a.duration || 0))
    }

    return videos
  }, [searchQuery, selectedCategory, sortBy])

  const videoCategories = mediaCategories.filter(cat => 
    ['vlog', 'cinematic', 'food', 'culture'].includes(cat.id)
  )

  const mostViewed = mockVideos.reduce((prev, current) => 
    prev.view_count > current.view_count ? prev : current
  )

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
                {mockVideos.length}
              </h3>
              <p className="text-gray-300 text-sm">Video</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-airen-neon-green mb-1">
                {mockVideos.reduce((acc, v) => acc + v.view_count, 0).toLocaleString()}
              </h3>
              <p className="text-gray-300 text-sm">Toplam İzlenme</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-airen-neon-purple mb-1">
                {Math.round(mockVideos.reduce((acc, v) => acc + (v.duration || 0), 0) / 60)}
              </h3>
              <p className="text-gray-300 text-sm">Dakika İçerik</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-400 mb-1">
                {mockVideos.reduce((acc, v) => acc + v.like_count, 0).toLocaleString()}
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
          <MediaCard media={mostViewed} variant="featured" />
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
              Tümü ({mockVideos.length})
            </Button>
            {videoCategories.map((category) => {
              const count = mockVideos.filter(v => v.category === category.id).length
              if (count === 0) return null
              
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'neon' : 'glass'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name} ({count})
                </Button>
              )
            })}
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
        {filteredVideos.length > 0 ? (
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

        {/* Load More */}
        {filteredVideos.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="glass" size="lg" className="animate-glow">
              Daha Fazla Video Yükle
            </Button>
          </div>
        )}

        {/* Categories Sidebar */}
        <aside className="mt-16">
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Video Kategorileri
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {videoCategories.map((category) => {
                  const count = mockVideos.filter(v => v.category === category.id).length
                  if (count === 0) return null
                  
                  return (
                    <Button
                      key={category.id}
                      variant="glass"
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex flex-col items-center p-4 h-auto space-y-2 hover:airen-glow transition-all"
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-xs">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
