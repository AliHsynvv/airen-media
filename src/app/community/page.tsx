'use client'

import { useMemo, useState } from 'react'
import { StoryCard } from '@/components/community/StoryCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useStories } from '@/lib/hooks/useStories'

const categories = [
  { key: 'all', label: 'Tümü' },
  { key: 'culture', label: 'Kültür' },
  { key: 'gastronomy', label: 'Gastronomi' },
  { key: 'adventure', label: 'Macera' },
  { key: 'budget', label: 'Bütçe' },
  { key: 'luxury', label: 'Lüks' },
]

export default function CommunityPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const { data, loading } = useStories()

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
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topluluk</h1>
          <p className="text-gray-600 mt-1">Kullanıcı hikayeleri ve deneyimler</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Hikaye ara..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-64 border border-gray-200 bg_WHITE text-gray-900"
          />
          <Link href="/community/stories/submit" className="px-4 py-2 rounded-md text-sm border border-gray-200 bg_WHITE text-black hover:bg-gray-50">
            Hikayeni Paylaş
          </Link>
        </div>
      </div>

      {/* Featured Stories */}
      {(loading || featuredStories.length > 0) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text_GRAY-900 mb-3">Öne Çıkanlar</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 rounded-xl animate-pulse border border-gray-200 bg_WHITE" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {featuredStories.map(story => (
                <StoryCard key={story.id} story={story} variant="responsive" />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-6 flex gap-2 flex-wrap">
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1 rounded-full text-sm transition-colors border ${
              category === c.key ? 'border-black bg_BLACK text_WHITE' : 'border-gray-200 bg_WHITE text-gray-700 hover:bg-gray-50'
            }`}
          >
            {c.label}
          </button>
        ))}
        <Badge className="ml-auto border border-gray-200 bg_WHITE text-gray-700">{loading ? 'Yükleniyor...' : `${filtered.length} hikaye`}</Badge>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse border border-gray-200 bg_WHITE" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {filtered.map(story => (
            <StoryCard key={story.id} story={story} variant="responsive" />
          ))}
        </div>
      )}
    </div>
  )
}


