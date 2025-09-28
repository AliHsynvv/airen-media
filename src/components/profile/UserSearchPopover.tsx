'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import Link from 'next/link'

type SearchResult = { type: 'user' | 'story' | 'hashtag'; id: string; title?: string; username?: string; slug?: string; avatar_url?: string | null }

export default function UserSearchPopover() {
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const popRef = useRef<HTMLDivElement | null>(null)

  type UserRow = { id: string; username: string | null; full_name: string | null; avatar_url: string | null }
  type StoryRow = { id: string; slug: string | null; title: string }

  const runSearch = useCallback(async (q: string) => {
    const term = q.trim()
    if (!term) { setSearchResults([]); return }
    const usersP = supabase.from('users_profiles').select('id,username,full_name,avatar_url').ilike('username', `%${term}%`).limit(5)
    const usersP2 = supabase.from('users_profiles').select('id,username,full_name,avatar_url').ilike('full_name', `%${term}%`).limit(5)
    const storiesP = supabase.from('user_stories').select('id,slug,title').ilike('title', `%${term}%`).limit(5)
    const tagsP = supabase.from('user_stories').select('id,slug,title,tags').contains('tags', [term]).limit(5)
    const [users, users2, stories, tags] = await Promise.all([usersP, usersP2, storiesP, tagsP])
    const uMap = new Map<string, UserRow>()
    ;(users.data as UserRow[] | null || []).concat((users2.data as UserRow[] | null || [])).forEach((u) => { uMap.set(String(u.id), u) })
    const results: SearchResult[] = []
    for (const u of Array.from(uMap.values())) results.push({ type: 'user', id: String(u.id), username: u.username || u.full_name || undefined, avatar_url: u.avatar_url || null })
    for (const s of ((stories.data as StoryRow[] | null) || [])) results.push({ type: 'story', id: String(s.id), title: s.title, slug: s.slug || undefined })
    for (const t of ((tags.data as StoryRow[] | null) || [])) results.push({ type: 'hashtag', id: String(t.id), title: `#${term}`, slug: t.slug || undefined })
    setSearchResults(results.slice(0, 12))
  }, [])

  useEffect(() => {
    const term = searchQuery.trim()
    if (!term) { setSearchResults([]); return }
    const t = setTimeout(() => { runSearch(term) }, 300)
    return () => clearTimeout(t)
  }, [searchQuery, runSearch])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (popRef.current && popRef.current.contains(target)) return
      setShowSearch(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowSearch(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  return (
    <>
      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={() => setShowSearch(true)} aria-label="Toplulukta Ara">
        <Search className="h-6 w-6" />
      </Button>
      {showSearch && (
        <div ref={popRef} className="fixed right-4 top-20 w-[92vw] max-w-2xl rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
          <div className="flex items-center gap-2 p-3 border-b border-gray-200">
            <Search className="h-5 w-5 text-gray-600" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Kullanıcı, gönderi veya #etiket ara"
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>
          <div className="max-h-[70vh] overflow-auto p-2">
            {searchResults.length ? (
              <ul className="divide-y divide-gray-100">
                {searchResults.map(r => (
                  <li key={`${r.type}-${r.id}`} className="py-2">
                    {r.type === 'user' ? (
                      <Link href={`/u/${r.id}`} className="flex items-center gap-2">
                        { }
                        {r.avatar_url ? (
                          <Image src={r.avatar_url} alt="avatar" width={28} height={28} className="rounded-full object-cover" sizes="28px" loading="lazy" unoptimized />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-gray-100" />
                        )}
                        <span className="text-sm text-gray-900">@{r.username}</span>
                      </Link>
                    ) : r.type === 'story' ? (
                      <Link href={r.slug ? `/community/stories/${r.slug}` : '#'} className="text-sm text-gray-900 hover:underline">{r.title}</Link>
                    ) : (
                      <Link href={`/community?tag=${encodeURIComponent((r.title||'').replace('#',''))}`} className="text-sm text-gray-900 hover:underline">{r.title}</Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-600">Sonuç yok.</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}


