'use client'

import { useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
const StoryCard = dynamic(() => import('@/components/community/StoryCard').then(m => m.StoryCard))
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlusCircle, Users, User } from 'lucide-react'
const MeetAirenButton = dynamic(() => import('@/components/home/MeetAirenButton'))
import Link from 'next/link'
import { useStories } from '@/lib/hooks/useStories'
import { useTranslations } from 'next-intl'

const categories = [
  { key: 'all', labelKey: 'all' },
  { key: 'culture', labelKey: 'culture' },
  { key: 'gastronomy', labelKey: 'gastronomy' },
  { key: 'adventure', labelKey: 'adventure' },
  { key: 'budget', labelKey: 'budget' },
  { key: 'luxury', labelKey: 'luxury' },
]

export default function CommunityPage() {
  const t = useTranslations('community.page')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const { data, loading } = useStories()
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const filtered = useMemo(() => {
    const list = data || []
    const q = query.toLowerCase()
    return list.filter(s => {
      const matchesQuery = s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q))
      const matchesCategory = category === 'all' || s.category === category
      return matchesQuery && matchesCategory
    })
  }, [query, category, data])

  const featuredStories = useMemo(() => {
    const list = data || []
    return list.filter(s => s.status === 'featured').slice(0, 6)
  }, [data])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Modern Header */}
        <div className="mb-10 sm:mb-12">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <div className="inline-flex items-center justify-center px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200">
              <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">✨ {t('subtitle')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800">
                {t('title')}
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Seyahat deneyimlerinizi paylaşın ve diğer gezginlerin hikayelerini keşfedin
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition duration-300" />
              <div className="relative">
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  ref={searchInputRef}
                  className="h-14 pl-14 pr-6 rounded-full border-2 border-gray-200 bg-white text-gray-900 text-base font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 shadow-xl"
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <MeetAirenButton className="text-sm h-12" />
          </div>
        </div>

        {/* Modern Featured Stories */}
        {(loading || featuredStories.length > 0) && (
          <div className="mb-12">
            <div className="mb-6">
              <div className="inline-flex items-center gap-3 mb-3">
                <div className="h-8 w-1.5 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">{t('featured')}</h2>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg shadow-lg">⭐</span>
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {featuredStories.slice(0, 12).map(story => (
                  <StoryCard key={story.id} story={story} variant="grid" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Business Link */}
        <div className="mb-6 flex justify-center">
          <Link 
            href="/community/business" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
          >
            <span>🏢</span>
            {t('business')}
          </Link>
        </div>

        {/* Modern Categories */}
        <div className="mb-8 flex gap-3 flex-wrap items-center justify-center">
          {categories.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                category === c.key 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md hover:scale-105'
              }`}
            >
              {t(`categories.${c.labelKey}` as any)}
              {category === c.key && (
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
              )}
            </button>
          ))}
          <span className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg">
            {loading ? t('loading') : `${filtered.length} ${filtered.length === 1 ? 'hikaye' : 'hikaye'}`}
          </span>
        </div>

        {/* Modern Action Buttons */}
        <div className="mb-10 flex items-center justify-center gap-4">
          <Button 
            variant="secondary" 
            className="group h-14 w-14 p-0 rounded-full border-2 border-gray-200 bg-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:border-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300" 
            asChild
          >
            <Link href="/community/stories/submit" aria-label={t('aria.submitStory')}>
              <PlusCircle className="h-7 w-7 text-gray-700 group-hover:text-white transition-colors" />
            </Link>
          </Button>
          <Button 
            variant="secondary" 
            className="group h-14 w-14 p-0 rounded-full border-2 border-gray-200 bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300" 
            asChild
          >
            <Link href="/community" aria-label={t('aria.backToCommunity')}>
              <Users className="h-7 w-7 text-gray-700 group-hover:text-white transition-colors" />
            </Link>
          </Button>
          <Button 
            variant="secondary" 
            className="group h-14 w-14 p-0 rounded-full border-2 border-gray-200 bg-white hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:border-green-600 shadow-lg hover:shadow-xl transition-all duration-300" 
            asChild
          >
            <Link href="/profile" aria-label={t('aria.profile')}>
              <User className="h-7 w-7 text-gray-700 group-hover:text-white transition-colors" />
            </Link>
          </Button>
        </div>

        {/* Modern Stories Grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-6 shadow-lg">
              <span className="text-4xl">📷</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Hikaye bulunamadı</h3>
            <p className="text-gray-600 mb-6">Arama kriterlerinize uygun hikaye yok.</p>
            <Button 
              onClick={() => { setQuery(''); setCategory('all'); }}
              className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg px-6"
            >
              Filtreleri Temizle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {filtered.map(story => (
              <StoryCard key={story.id} story={story} variant="grid" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


