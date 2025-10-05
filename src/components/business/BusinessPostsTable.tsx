'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type Post = {
  id: string
  title: string | null
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  scheduled_at: string | null
  published_at: string | null
  created_at: string
}

export default function BusinessPostsTable({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Post[]>([])
  const [tab, setTab] = useState<'all' | 'scheduled' | 'drafts'>('all')
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('business_posts')
        .select('id,title,status,scheduled_at,published_at,created_at')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(200)
      const { data, error } = await query
      if (error) throw error
      setItems((data || []) as Post[])
    } catch (e: any) {
      setError(e?.message || 'Yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [businessId])
  useEffect(() => {
    const handler = () => load()
    if (typeof window !== 'undefined') window.addEventListener('business:post-created', handler)
    return () => { if (typeof window !== 'undefined') window.removeEventListener('business:post-created', handler) }
  }, [])

  const filtered = useMemo(() => {
    if (tab === 'scheduled') return items.filter(p => p.status === 'scheduled')
    if (tab === 'drafts') return items.filter(p => p.status === 'draft')
    return items
  }, [items, tab])

  const openNewPost = () => { if (typeof window !== 'undefined') window.location.hash = '#new-post' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Posts</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openNewPost} className="rounded-full">New Post</Button>
          <Button variant="outline" onClick={load}>Refresh</Button>
        </div>
      </div>

      <div className="border-b flex items-center gap-4 text-sm">
        <button onClick={() => setTab('all')} className={`py-2 ${tab==='all'?'text-black border-b-2 border-black':'text-gray-600 hover:text-black'}`}>All</button>
        <button onClick={() => setTab('scheduled')} className={`py-2 ${tab==='scheduled'?'text-black border-b-2 border-black':'text-gray-600 hover:text-black'}`}>Scheduled</button>
        <button onClick={() => setTab('drafts')} className={`py-2 ${tab==='drafts'?'text-black border-b-2 border-black':'text-gray-600 hover:text-black'}`}>Drafts</button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="rounded-2xl bg-white border border-gray-100 p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="py-2 pl-4 pr-3">Post</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Scheduled</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const pill = p.status === 'published' ? 'bg-emerald-50 text-emerald-700' : p.status === 'scheduled' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-700'
              const sched = p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString() : 'Not Scheduled'
              return (
                <tr key={p.id} className="border-t">
                  <td className="py-2 pl-4 pr-3">{p.title || '—'}</td>
                  <td className="py-2 pr-3"><span className={`px-2 py-1 rounded-full text-xs ${pill}`}>{p.status[0].toUpperCase()+p.status.slice(1)}</span></td>
                  <td className="py-2 pr-3">{sched}</td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600 hover:underline" onClick={() => {
                        const title = prompt('Başlık', p.title || '')
                        if (title === null) return
                        fetch(`/api/business/posts/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
                          .then(() => load())
                      }}>Edit</button>
                      {p.status !== 'published' ? (
                        <button className="text-emerald-600 hover:underline" onClick={() => {
                          fetch(`/api/business/posts/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'published', published_at: new Date().toISOString(), scheduled_at: null }) })
                            .then(() => load())
                        }}>Publish</button>
                      ) : (
                        <button className="text-gray-600 hover:underline" onClick={() => {
                          fetch(`/api/business/posts/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'draft', published_at: null }) })
                            .then(() => load())
                        }}>Unpublish</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {!loading && filtered.length === 0 && (
              <tr><td className="py-4 text-gray-500 pl-4" colSpan={4}>No posts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


