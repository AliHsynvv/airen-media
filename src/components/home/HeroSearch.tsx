'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export default function HeroSearch() {
  const t = useTranslations('home.hero.search')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const phrases = useMemo(() => {
    const rawPhrases = t.raw('phrases')
    return Array.isArray(rawPhrases) ? rawPhrases : []
  }, [t])

  const current = useMemo(() => phrases[index % phrases.length] || '', [phrases, index])

  useEffect(() => {
    // typewriter effect on placeholder
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTyped(prev => {
        if (!deleting) {
          const next = current.slice(0, prev.length + 1)
          if (next.length === current.length) {
            // pause at full text, then start deleting
            setTimeout(() => setDeleting(true), 1200)
          }
          return next
        } else {
          const next = prev.slice(0, -1)
          if (next.length === 0) {
            setDeleting(false)
            setIndex(i => (i + 1) % phrases.length)
          }
          return next
        }
      })
    }, deleting ? 24 : 36)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [current, deleting, phrases])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim() || current
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl">
      <div className="group relative flex items-center rounded-[9999px] border border-gray-100 bg-white/80 backdrop-blur px-3 py-1.5 shadow-sm hover:shadow transition">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={typed || t('placeholder')}
          className={cn(
            'ml-3 w-full bg-transparent placeholder-gray-400 text-gray-900',
            'focus:outline-none h-9'
          )}
          aria-label={t('button')}
        />
        <button
          type="submit"
          className="ml-3 inline-flex items-center rounded-[9999px] bg-black text-white px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-black/90"
        >
          {t('button')}
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {t('popularSuggestions')}
      </div>
    </form>
  )
}


