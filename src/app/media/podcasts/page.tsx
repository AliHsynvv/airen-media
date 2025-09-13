'use client'

import { useState, useMemo } from 'react'
import { Search, Play, Headphones, TrendingUp, Clock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MediaCard } from '@/components/media/MediaCard'
import { AudioPlayer } from '@/components/media/AudioPlayer'
import { mockPodcasts } from '@/lib/data/mock-media'
import { formatDuration } from '@/lib/utils/formatters'

export default function PodcastsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'duration'>('newest')
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)

  const filteredPodcasts = useMemo(() => {
    const podcasts = mockPodcasts.filter(podcast => {
      return searchQuery === '' || 
        podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        podcast.description?.toLowerCase().includes(searchQuery.toLowerCase())
    })

    // Sort podcasts
    if (sortBy === 'newest') {
      podcasts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'popular') {
      podcasts.sort((a, b) => b.view_count - a.view_count)
    } else if (sortBy === 'duration') {
      podcasts.sort((a, b) => (b.duration || 0) - (a.duration || 0))
    }

    return podcasts
  }, [searchQuery, sortBy])

  const latestEpisode = mockPodcasts[0]
  const totalDuration = mockPodcasts.reduce((acc, p) => acc + (p.duration || 0), 0)
  const totalListens = mockPodcasts.reduce((acc, p) => acc + p.view_count, 0)

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="airen-gradient-text">Airen Talks</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Turizm dünyasından söyleşiler, trendler ve uzman görüşleri
          </p>
        </div>

        {/* Podcast Stats */}
        <div className="glass-card p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-airen-neon-purple rounded-lg mx-auto mb-3">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{mockPodcasts.length}</h3>
              <p className="text-gray-300 text-sm">Podcast Bölümü</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-airen-neon-blue to-airen-neon-green rounded-lg mx-auto mb-3">
                <Play className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{totalListens.toLocaleString()}</h3>
              <p className="text-gray-300 text-sm">Toplam Dinlenme</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-airen-neon-green to-airen-neon-purple rounded-lg mx-auto mb-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {Math.round(totalDuration / 3600)}
              </h3>
              <p className="text-gray-300 text-sm">Saat İçerik</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-airen-neon-purple to-orange-500 rounded-lg mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Haftalık</h3>
              <p className="text-gray-300 text-sm">Yayın Programı</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Latest Episode Player */}
            {latestEpisode && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="w-1 h-6 bg-orange-500 mr-3 rounded-full"></span>
                  Son Bölüm
                </h2>
                <AudioPlayer
                  url={latestEpisode.url}
                  title={latestEpisode.title}
                  description={latestEpisode.description}
                  thumbnail={latestEpisode.thumbnail_url}
                  uploader={{
                    name: latestEpisode.uploader?.full_name || 'Airen Global',
                    avatar: latestEpisode.uploader?.avatar_url
                  }}
                  duration={latestEpisode.duration}
                  episode={latestEpisode.metadata?.episode}
                  season={latestEpisode.metadata?.season}
                />
              </section>
            )}

            {/* Search and Filters */}
            <div className="glass-card p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Podcast ara..."
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
              </div>
            </div>

            {/* Results */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                {filteredPodcasts.length} bölüm bulundu
              </p>
              
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-white"
                >
                  Aramayı Temizle
                </Button>
              )}
            </div>

            {/* Episodes List */}
            {filteredPodcasts.length > 0 ? (
              <div className="space-y-6">
                {filteredPodcasts.slice(1).map((podcast) => (
                  <MediaCard
                    key={podcast.id}
                    media={podcast}
                    variant="compact"
                    isPlaying={currentlyPlaying === podcast.id}
                    onPlay={() => setCurrentlyPlaying(podcast.id)}
                    onPause={() => setCurrentlyPlaying(null)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full glass-card flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Podcast Bulunamadı
                </h3>
                <p className="text-gray-400 mb-6">
                  Arama kriterinizi değiştirerek tekrar deneyin
                </p>
                <Button
                  variant="neon"
                  onClick={() => setSearchQuery('')}
                >
                  Tüm Bölümleri Göster
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* About Airen Talks */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Headphones className="h-5 w-5 text-orange-500 mr-2" />
                  Airen Talks Hakkında
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Turizm dünyasının trendlerini, seyahat deneyimlerini ve kültürel 
                  keşifleri ele alan haftalık podcast serimiz.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Yayın Günü:</span>
                    <span className="text-white">Her Salı</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ortalama Süre:</span>
                    <span className="text-white">45 dakika</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Format:</span>
                    <span className="text-white">MP3, 192kbps</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Episodes */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Son Bölümler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPodcasts.slice(0, 3).map((podcast, index) => (
                    <div key={podcast.id} className="group">
                      <div className="flex items-start space-x-3">
                        <Badge variant="glass" className="text-xs flex-shrink-0">
                          #{mockPodcasts.length - index}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white group-hover:text-airen-neon-blue transition-colors line-clamp-2 mb-1">
                            {podcast.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{formatDuration(podcast.duration || 0)}</span>
                            <span>{podcast.view_count.toLocaleString()} dinlenme</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscribe */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Abone Ol</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4">
                  Yeni bölümlerden haberdar olmak için abone olun
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="E-posta adresiniz"
                    className="bg-airen-dark-2 border-white/20 text-white"
                  />
                  <Button variant="neon" size="sm" className="w-full">
                    Abone Ol
                  </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Podcast platformları:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="glass" size="sm" className="text-xs">
                      Spotify
                    </Button>
                    <Button variant="glass" size="sm" className="text-xs">
                      Apple Podcasts
                    </Button>
                    <Button variant="glass" size="sm" className="text-xs">
                      Google Podcasts
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download All */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <Button variant="glass" className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Tüm Bölümleri İndir
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Load More */}
        {filteredPodcasts.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="glass" size="lg" className="animate-glow">
              Daha Fazla Bölüm Yükle
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
