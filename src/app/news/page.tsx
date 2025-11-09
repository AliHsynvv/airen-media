'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, LayoutGrid, List, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'
const ArticleCard = dynamic(() => import('@/components/articles/ArticleCard').then(m => m.ArticleCard))
import { useArticles } from '@/lib/hooks/useArticles'
import { supabase } from '@/lib/supabase/client'
const MeetAirenButton = dynamic(() => import('@/components/home/MeetAirenButton'))
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { translateArticles, type ArticleLocale } from '@/lib/utils/article-translation'

type SortKey = 'latest' | 'popular'
type ViewKey = 'grid' | 'list'

type UiCategory = { key: string; label: string }

export default function NewsPage() {
  const t = useTranslations('news')
  const localeFromHook = useLocale() as ArticleLocale
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [categories, setCategories] = useState<UiCategory[]>([{ key: 'all', label: t('categories.all') }])
  const [sortBy, setSortBy] = useState<SortKey>('latest')
  const [view, setView] = useState<ViewKey>('grid')
  
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

  const { data: liveArticles, loading } = useArticles({ type: 'news', status: 'published', limit: 100 })
  const news = useMemo(() => {
    const articles = (liveArticles || []).filter(a => a.type === 'news')
    return translateArticles(articles, locale)
  }, [liveArticles, locale])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-8 sm:p-16 text-center max-w-6xl mx-auto mb-12 sm:mb-16 shadow-2xl">
          {/* Animated gradient orbs */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-500/30 to-pink-500/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-xs sm:text-sm font-medium text-white/90 uppercase tracking-wider">✨ {t('subtitle')}</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200 drop-shadow-2xl">
                {t('title')}
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              Dünyanın dört bir yanından en güncel seyahat haberleri, rehberleri ve ilham verici hikayeler
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Button 
                asChild 
                size="lg" 
                className="h-14 w-full sm:w-auto rounded-full text-white font-bold px-8 shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 border-0 transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/profile">{t('socialMediaButton')}</Link>
              </Button>
              <MeetAirenButton fullWidth className="h-14" />
            </div>
          </div>
        </div>

        {/* Modern Search Bar */}
        <div className="max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full blur-lg opacity-25 group-hover:opacity-40 transition duration-300" />
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              <Input 
                className="pl-14 pr-14 h-16 rounded-full border-2 border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 shadow-xl text-base font-medium transition-all duration-300" 
                placeholder={t('searchPlaceholder')} 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
              />
              {query && (
                <button
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-indigo-600 transition-all duration-300 shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modern Categories & Controls */}
        <div className="max-w-7xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            {/* Categories */}
            <div className="flex-1 w-full overflow-x-auto pb-2">
              <div className="inline-flex gap-3">
                {categories.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`relative h-11 px-6 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                      category === c.key 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    {c.label}
                    {category === c.key && (
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Mobile select */}
              <select 
                className="sm:hidden flex-1 h-11 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700 px-4 font-medium shadow-sm" 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value as SortKey)}
              >
                <option value="latest">{t('sort.latest')}</option>
                <option value="popular">{t('sort.popular')}</option>
              </select>

              {/* Desktop sort */}
              <div className="hidden sm:inline-flex p-1.5 rounded-xl border-2 border-gray-200 bg-white shadow-sm">
                <button
                  onClick={() => setSortBy('latest')}
                  className={`h-9 px-5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    sortBy === 'latest' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t('sort.latest')}
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`h-9 px-5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    sortBy === 'popular' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t('sort.popular')}
                </button>
              </div>

              {/* View toggle */}
              <div className="inline-flex p-1.5 rounded-xl border-2 border-gray-200 bg-white shadow-sm">
                <button 
                  className={`h-9 w-9 inline-flex items-center justify-center rounded-lg transition-all duration-300 ${
                    view === 'grid' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`} 
                  onClick={() => setView('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  className={`h-9 w-9 inline-flex items-center justify-center rounded-lg transition-all duration-300 ${
                    view === 'list' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`} 
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border-2 border-gray-100 h-96 animate-pulse shadow-lg">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sonuç bulunamadı</h3>
              <p className="text-gray-500">{t('noResults')}</p>
            </div>
          ) : view === 'list' ? (
            <div className="space-y-6">
              {filtered.map(a => (
                <ArticleCard key={a.id} article={a} variant="compact" theme="light" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((a, i) => (
                <div 
                  key={a.id} 
                  className={`${i === 0 ? 'md:col-span-2 lg:col-span-3' : ''} transform hover:-translate-y-2 transition-all duration-300`}
                >
                  <ArticleCard article={a} variant={i === 0 ? 'featured' : 'default'} theme="light" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
