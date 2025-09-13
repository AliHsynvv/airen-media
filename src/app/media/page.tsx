'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Video, Headphones, TrendingUp, Clock, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MediaCard } from '@/components/media/MediaCard'
import { mockVideos, mockPodcasts, mockAllMedia, mediaCategories } from '@/lib/data/mock-media'

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'podcasts'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const getFilteredMedia = () => {
    let media = mockAllMedia
    
    if (activeTab === 'videos') {
      media = mockVideos
    } else if (activeTab === 'podcasts') {
      media = mockPodcasts
    }

    if (selectedCategory) {
      media = media.filter(m => m.category === selectedCategory)
    }

    return media
  }

  const filteredMedia = getFilteredMedia()
  const featuredVideo = mockVideos.find(v => v.view_count > 15000) // Most viewed
  const latestPodcast = mockPodcasts[0] // Most recent

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="airen-gradient-text">Medya Hub</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Airen&apos;in video içerikleri, podcast&apos;leri ve seyahat deneyimleri
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-airen-neon-blue to-airen-neon-purple rounded-lg mx-auto mb-3">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{mockVideos.length}</h3>
              <p className="text-gray-300 text-sm">Video İçerik</p>
            </CardContent>
          </Card>

          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-airen-neon-green to-airen-neon-blue rounded-lg mx-auto mb-3">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{mockPodcasts.length}</h3>
              <p className="text-gray-300 text-sm">Podcast Bölümü</p>
            </CardContent>
          </Card>

          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-airen-neon-purple to-airen-neon-green rounded-lg mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {mockAllMedia.reduce((acc, m) => acc + m.view_count, 0).toLocaleString()}
              </h3>
              <p className="text-gray-300 text-sm">Toplam İzlenme</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Content */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
            <span className="w-1 h-6 bg-airen-neon-blue mr-3 rounded-full"></span>
            Öne Çıkan İçerik
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Featured Video */}
            {featuredVideo && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">En Popüler Video</h3>
                  <Button variant="glass" size="sm" asChild>
                    <Link href="/media/videos">
                      Tüm Videolar
                    </Link>
                  </Button>
                </div>
                <MediaCard media={featuredVideo} variant="featured" />
              </div>
            )}

            {/* Latest Podcast */}
            {latestPodcast && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Son Podcast</h3>
                  <Button variant="glass" size="sm" asChild>
                    <Link href="/media/podcasts">
                      Tüm Podcast&apos;ler
                    </Link>
                  </Button>
                </div>
                <MediaCard media={latestPodcast} variant="featured" />
              </div>
            )}
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Content Type Tabs */}
            <div className="flex items-center space-x-2">
              <Button
                variant={activeTab === 'all' ? 'neon' : 'glass'}
                size="sm"
                onClick={() => setActiveTab('all')}
              >
                Tümü ({mockAllMedia.length})
              </Button>
              <Button
                variant={activeTab === 'videos' ? 'neon' : 'glass'}
                size="sm"
                onClick={() => setActiveTab('videos')}
              >
                <Video className="h-4 w-4 mr-1" />
                Videolar ({mockVideos.length})
              </Button>
              <Button
                variant={activeTab === 'podcasts' ? 'neon' : 'glass'}
                size="sm"
                onClick={() => setActiveTab('podcasts')}
              >
                <Headphones className="h-4 w-4 mr-1" />
                Podcast&apos;ler ({mockPodcasts.length})
              </Button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? 'neon' : 'glass'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Tüm Kategoriler
              </Button>
              {mediaCategories.map((category) => {
                const count = filteredMedia.filter(m => m.category === category.id).length
                if (count === 0 && selectedCategory !== category.id) return null
                
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
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            {filteredMedia.length} içerik bulundu
            {activeTab !== 'all' && (
              <span className="ml-2">
                • {activeTab === 'videos' ? 'Videolar' : 'Podcast\'ler'}
              </span>
            )}
            {selectedCategory && (
              <span className="ml-2">
                • {mediaCategories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
          </p>
          
          {(selectedCategory) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory(null)
              }}
              className="text-gray-400 hover:text-white"
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>

        {/* Media Grid */}
        {filteredMedia.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMedia.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                variant="default"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full glass-card flex items-center justify-center">
              {activeTab === 'videos' ? (
                <Video className="h-8 w-8 text-gray-400" />
              ) : activeTab === 'podcasts' ? (
                <Headphones className="h-8 w-8 text-gray-400" />
              ) : (
                <Filter className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              İçerik Bulunamadı
            </h3>
            <p className="text-gray-400 mb-6">
              Seçtiğiniz kriterlere uygun içerik bulunmuyor
            </p>
            <Button
              variant="neon"
              onClick={() => {
                setActiveTab('all')
                setSelectedCategory(null)
              }}
            >
              Tüm İçerikleri Göster
            </Button>
          </div>
        )}

        {/* Quick Access */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
            <span className="w-1 h-6 bg-airen-neon-green mr-3 rounded-full"></span>
            Hızlı Erişim
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card group hover:airen-glow transition-all duration-500">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-airen-neon-blue to-airen-neon-purple rounded-lg flex items-center justify-center">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white group-hover:text-airen-neon-blue transition-colors">
                      Airen Vlogları
                    </CardTitle>
                    <p className="text-gray-300 text-sm">
                      Şehir sunumları ve seyahat deneyimleri
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="glass" size="sm" asChild className="w-full">
                  <Link href="/media/videos?category=vlog">
                    Vlogları İzle
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card group hover:airen-glow transition-all duration-500">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-airen-neon-green to-orange-500 rounded-lg flex items-center justify-center">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white group-hover:text-airen-neon-green transition-colors">
                      Airen Talks
                    </CardTitle>
                    <p className="text-gray-300 text-sm">
                      Turizm trendleri ve seyahat söyleşileri
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="glass" size="sm" asChild className="w-full">
                  <Link href="/media/podcasts">
                    Podcast&apos;leri Dinle
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
