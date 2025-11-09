'use client'

import { useState, useMemo, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Search, Filter, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { useArticles } from '@/lib/hooks/useArticles'
import { translateArticles, type ArticleLocale } from '@/lib/utils/article-translation'

export default function ArticlesPage() {
  const localeFromHook = useLocale() as ArticleLocale
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Get locale from cookie directly on mount
  const [locale, setLocale] = useState<ArticleLocale>(() => {
    if (typeof window !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1]
      return (cookieValue || localeFromHook) as ArticleLocale
    }
    return localeFromHook
  })
  
  useEffect(() => {
    // Update locale when component mounts or hook changes
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1]
    const newLocale = (cookieValue || localeFromHook) as ArticleLocale
    setLocale(newLocale)
  }, [localeFromHook])

  const { data: liveArticles } = useArticles({ type: 'article', status: 'published', limit: 100 })
  const articles = useMemo(() => {
    const filtered = liveArticles.filter(article => article.type === 'article')
    return translateArticles(filtered, locale)
  }, [liveArticles, locale])
  
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>()
    for (const a of articles) {
      const id = (a as any).category_id
      const name = (a as any).category?.name || 'Diğer'
      if (!id) continue
      const cur = map.get(id)
      if (cur) {
        cur.count += 1
      } else {
        map.set(id, { id, name, count: 1 })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [articles])
  
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === null || 
        (article as any).category_id === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, articles])

  const featuredArticles = articles.filter(article => article.featured)

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="airen-gradient-text">Makaleler</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Dünya çapında seyahat deneyimleri, kültürel keşifler ve pratik rehberler
          </p>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
              <span className="w-1 h-6 bg-airen-neon-blue mr-3 rounded-full"></span>
              Öne Çıkanlar
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredArticles.slice(0, 2).map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="featured"
                />
              ))}
            </div>
          </section>
        )}

        {/* Filters and Search */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Makale ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-airen-dark-2 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* View Mode Toggle */}
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
              Tümü ({articles.length})
            </Button>
            {categories.map((category) => (
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
            {filteredArticles.length} makale bulundu
            {selectedCategory && (
              <span className="ml-2">
                • Kategori: {categories.find(c => c.id === selectedCategory)?.name}
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

        {/* Articles Grid/List */}
        {filteredArticles.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
              : 'space-y-6'
          }>
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
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
              Makale Bulunamadı
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
              Tüm Makaleleri Göster
            </Button>
          </div>
        )}

        {/* Load More Button (for future pagination) */}
        {filteredArticles.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="glass" size="lg" className="animate-glow">
              Daha Fazla Makale Yükle
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
