'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, LayoutGrid, List, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'
const ArticleCard = dynamic(() => import('@/components/articles/ArticleCard').then(m => m.ArticleCard))
import { useArticles } from '@/lib/hooks/useArticles'
import { supabase } from '@/lib/supabase/client'
const MeetAirenButton = dynamic(() => import('@/components/home/MeetAirenButton'))
import Link from 'next/link'
import { useTranslations } from 'next-intl'

type SortKey = 'latest' | 'popular'
type ViewKey = 'grid' | 'list'

type UiCategory = { key: string; label: string }

export default function NewsPage() {
  const t = useTranslations('news')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [categories, setCategories] = useState<UiCategory[]>([{ key: 'all', label: t('categories.all') }])
  const [sortBy, setSortBy] = useState<SortKey>('latest')
  const [view, setView] = useState<ViewKey>('grid')

  const { data: liveArticles, loading } = useArticles({ type: 'news', status: 'published', limit: 100 })
  const news = (liveArticles || []).filter(a => a.type === 'news')

  useEffect(() => {
    let mounted = true
    const loadCats = async () => {
      const res = await fetch('/api/news/categories', { cache: 'force-cache' })
      const json = await res.json()
      if (!mounted) return
      if (json.success) {
        const ui: UiCategory[] = [{ key: 'all', label: t('categories.all') }].concat((json.data || []).map((c: any) => ({ key: c.id, label: c.name })))
        setCategories(ui)
      } else {
        setCategories([{ key: 'all', label: t('categories.all') }])
      }
    }
    loadCats()
    return () => { mounted = false }
  }, [t])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let arr = news.filter(a =>
      !q || a.title.toLowerCase().includes(q) || (a.excerpt || '').toLowerCase().includes(q)
    )
    if (category !== 'all') {
      arr = arr.filter(a => {
        const catId = (a as any).category_id || ''
        return catId === category
      })
    }
    if (sortBy === 'latest') {
      arr = arr.sort((a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime())
    } else {
      arr = arr.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    }
    return arr
  }, [news, query, category, sortBy])

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-3">{t('subtitle')}</p>
        <div className="mt-6 flex flex-row gap-2 items-center w-full">
          <div className="w-1/2 min-w-0">
            <Button asChild size="lg" className="h-12 w-full rounded-full text-white font-semibold uppercase tracking-wide px-5 sm:px-6 shadow-lg bg-gradient-to-r from-[#141432] via-[#5b21b6] to-[#a21caf] hover:from-[#1a1a44] hover:via-[#6d28d9] hover:to-[#db2777] border-0 text-xs sm:text-sm">
              <Link href="/profile">{t('socialMediaButton')}</Link>
            </Button>
          </div>
          <div className="w-1/2 min-w-0">
            <MeetAirenButton fullWidth className="text-xs sm:text-sm" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input className="pl-9 h-11 rounded-lg border-gray-200" placeholder={t('searchPlaceholder')} value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {/* Categories + controls */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`h-9 px-3 rounded-md border ${category === c.key ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            {c.label}
          </button>
        ))}

        <div className="ml-auto inline-flex items-center gap-2">
          <select className="h-9 rounded-md border border-gray-200 bg-white text-sm text-gray-700 px-3" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
            <option value="latest">{t('sort.latest')}</option>
            <option value="popular">{t('sort.popular')}</option>
          </select>
          <button className={`h-9 w-9 inline-flex items-center justify-center rounded-md border ${view === 'grid' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`} onClick={() => setView('grid')}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button className={`h-9 w-9 inline-flex items-center justify-center rounded-md border ${view === 'list' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`} onClick={() => setView('list')}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500">{t('noResults')}</div>
      ) : view === 'list' ? (
        <div className="space-y-4">
          {filtered.map(a => (
            <ArticleCard key={a.id} article={a} variant="compact" theme="light" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((a, i) => (
            <div key={a.id} className={`${i === 0 ? 'md:col-span-2' : ''}`}>
              <ArticleCard article={a} variant={i === 0 ? 'featured' : 'default'} theme="light" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
