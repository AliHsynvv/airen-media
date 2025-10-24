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
    <div className="container mx-auto px-0 sm:px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <div className="w-full sm:w-auto flex items-center gap-2">
          <div className="flex-1 sm:flex-none">
            <Input
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={e => setQuery(e.target.value)}
              ref={searchInputRef}
              className="w-full sm:w-72 rounded-full border border-gray-200 bg-white text-gray-900"
            />
          </div>
          <MeetAirenButton className="text-xs sm:text-sm" />
        </div>
      </div>

      {/* Featured Stories */}
      {(loading || featuredStories.length > 0) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('featured')}</h2>
          {loading ? (
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square rounded-md animate-pulse border border-gray-200 bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {featuredStories.slice(0, 12).map(story => (
                <StoryCard key={story.id} story={story} variant="grid" />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-2">
        <Link href="/community/business" className="inline-flex items-center gap-2 text-sm underline">{t('business')}</Link>
      </div>

      <div className="mb-6 flex gap-2 flex-wrap items-center">
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${
              category === c.key ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t(`categories.${c.labelKey}` as any)}
          </button>
        ))}
        <span className="ml-auto inline-flex items-center justify-center h-7 px-3 rounded-full text-xs border border-gray-200 bg-white text-gray-700">
          {loading ? t('loading') : t('storiesCount', { count: filtered.length })}
        </span>
      </div>

      {/* Actions under categories (mirrors profile icons) */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
          <Link href="/community/stories/submit" aria-label={t('aria.submitStory')}>
            <PlusCircle className="h-6 w-6" />
          </Link>
        </Button>
        <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
          <Link href="/community" aria-label={t('aria.backToCommunity')}>
            <Users className="h-6 w-6" />
          </Link>
        </Button>
        <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
          <Link href="/profile" aria-label={t('aria.profile')}>
            <User className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-1">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square rounded-md animate-pulse border border-gray-200 bg-white" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {filtered.map(story => (
            <StoryCard key={story.id} story={story} variant="grid" />
          ))}
        </div>
      )}
    </div>
  )
}


