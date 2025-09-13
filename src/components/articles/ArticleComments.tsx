'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ArticleCommentsProps {
  articleId: string
  className?: string
}

interface CommentRow {
  id: string
  article_id: string
  user_id: string
  content: string
  created_at: string
}

interface ProfileRow {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

export default function ArticleComments({ articleId, className }: ArticleCommentsProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [list, setList] = useState<CommentRow[]>([])
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({})
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const { data: u } = await supabase.auth.getUser()
        if (mounted) setUserId(u.user?.id ?? null)
        const { data } = await supabase
          .from('article_comments')
          .select('id,article_id,user_id,content,created_at')
          .eq('article_id', articleId)
          .order('created_at', { ascending: false })
        if (mounted) setList(data || [])
        const userIds = Array.from(new Set((data || []).map(r => r.user_id)))
        if (userIds.length) {
          const { data: profs } = await supabase
            .from('users_profiles')
            .select('id,full_name,username,avatar_url')
            .in('id', userIds)
          const map: Record<string, ProfileRow> = {}
          for (const p of profs || []) map[p.id] = p
          if (mounted) setProfiles(map)
        } else {
          if (mounted) setProfiles({})
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [articleId])

  const submit = async () => {
    if (!userId) { window.location.href = '/auth/login'; return }
    const body = comment.trim()
    if (!body) return
    setSubmitting(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('article_comments')
        .insert({ article_id: articleId, user_id: userId, content: body })
      if (error) throw error
      setComment('')
      const { data } = await supabase
        .from('article_comments')
        .select('id,article_id,user_id,content,created_at')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false })
      setList(data || [])
      const userIds = Array.from(new Set((data || []).map(r => r.user_id)))
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('users_profiles')
          .select('id,full_name,username,avatar_url')
          .in('id', userIds)
        const map: Record<string, ProfileRow> = {}
        for (const p of profs || []) map[p.id] = p
        setProfiles(map)
      } else {
        setProfiles({})
      }
    } catch (e: any) {
      setError(e?.message || 'Unexpected error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Comments</h3>
      <div className="rounded-lg border border-gray-200 p-3 mb-4 bg-white">
        <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Yorumunuzu yazın" className="min-h-[80px]" />
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm" onClick={submit} disabled={submitting} className="border border-gray-200 bg-white text-black hover:bg-gray-50">{submitting ? 'Gönderiliyor...' : 'Gönder'}</Button>
          {!userId && <span className="text-xs text-gray-400">Yorum yapmak için giriş yapın</span>}
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      </div>

      <div className="space-y-3">
        {loading && <div className="text-sm text-gray-500">Yükleniyor...</div>}
        {!loading && list.length === 0 && (
          <div className="text-sm text-gray-500">Henüz yorum yok.</div>
        )}
        {list.map(r => (
          <div key={r.id} className="rounded-lg border border-gray-200 p-3 bg-white">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
              <span className="text-xs text-gray-600 ml-2">{profiles[r.user_id]?.full_name || profiles[r.user_id]?.username || 'Kullanıcı'}</span>
            </div>
            <div className="mt-2 text-sm text-gray-800">{r.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


