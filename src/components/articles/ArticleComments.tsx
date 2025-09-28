'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Loader2, Send, Heart, CornerUpRight } from 'lucide-react'

interface ArticleCommentsProps {
  articleId: string
  className?: string
}

interface CommentRow {
  id: string
  article_id: string
  user_id: string
  content: string
  parent_id?: string | null
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
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [list, setList] = useState<CommentRow[]>([])
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({})
  const [comment, setComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [likeCountById, setLikeCountById] = useState<Record<string, number>>({})
  const [likedByMe, setLikedByMe] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const maxLength = 500

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const { data: u } = await supabase.auth.getUser()
        const uid = u.user?.id ?? null
        if (mounted) setUserId(uid)
        if (uid) {
          const { data: me } = await supabase
            .from('users_profiles')
            .select('id, full_name, username, avatar_url')
            .eq('id', uid)
            .maybeSingle()
          if (mounted) {
            setUserAvatar(me?.avatar_url ?? null)
            setUserName(me?.full_name || me?.username || null)
          }
        } else {
          if (mounted) { setUserAvatar(null); setUserName(null) }
        }
        const { data } = await supabase
          .from('article_comments')
          .select('id,article_id,user_id,content,parent_id,created_at')
          .eq('article_id', articleId)
          .order('created_at', { ascending: true })
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

        // Load likes per comment
        const cids = Array.from(new Set((data || []).map(r => r.id)))
        if (cids.length) {
          const likesRes = await supabase
            .from('article_comment_likes')
            .select('comment_id,user_id')
            .in('comment_id', cids)
          const counts: Record<string, number> = {}
          const mine = new Set<string>()
          for (const row of (likesRes.data || [])) {
            const cid = (row as { comment_id: string }).comment_id as string
            counts[cid] = (counts[cid] || 0) + 1
            if (uid && (row as { user_id: string }).user_id === uid) mine.add(cid)
          }
          if (mounted) {
            setLikeCountById(counts)
            const likedMap: Record<string, boolean> = {}
            for (const id of cids) likedMap[id] = mine.has(id)
            setLikedByMe(likedMap)
          }
        } else {
          if (mounted) { setLikeCountById({}); setLikedByMe({}) }
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
        .insert({ article_id: articleId, user_id: userId, content: body, parent_id: replyTo })
      if (error) throw error
      setComment('')
      setReplyTo(null)
      const { data } = await supabase
        .from('article_comments')
        .select('id,article_id,user_id,content,parent_id,created_at')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true })
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

      // reload likes map
      const cids = Array.from(new Set((data || []).map(r => r.id)))
      if (cids.length) {
        const likesRes = await supabase
          .from('article_comment_likes')
          .select('comment_id,user_id')
          .in('comment_id', cids)
        const counts: Record<string, number> = {}
        const mine = new Set<string>()
        for (const row of (likesRes.data || [])) {
          const cid = (row as { comment_id: string }).comment_id as string
          counts[cid] = (counts[cid] || 0) + 1
          if (userId && (row as { user_id: string }).user_id === userId) mine.add(cid)
        }
        setLikeCountById(counts)
        const likedMap: Record<string, boolean> = {}
        for (const id of cids) likedMap[id] = mine.has(id)
        setLikedByMe(likedMap)
      } else {
        setLikeCountById({}); setLikedByMe({})
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!submitting) submit()
    }
  }

  const toggleLike = async (commentId: string) => {
    const uid = userId
    if (!uid) { window.location.href = '/auth/login'; return }
    const currentlyLiked = !!likedByMe[commentId]
    // optimistic
    setLikedByMe(prev => ({ ...prev, [commentId]: !currentlyLiked }))
    setLikeCountById(prev => ({ ...prev, [commentId]: Math.max(0, (prev[commentId] || 0) + (currentlyLiked ? -1 : 1)) }))
    if (currentlyLiked) {
      const res = await fetch('/api/articles/comments/like', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      })
      if (!res.ok) {
        // rollback
        setLikedByMe(prev => ({ ...prev, [commentId]: true }))
        setLikeCountById(prev => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }))
        const j = await res.json().catch(() => null) as { error?: string } | null
        alert(`Beğeni silinemedi: ${j?.error || res.statusText}`)
      }
    } else {
      const res = await fetch('/api/articles/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      })
      if (!res.ok) {
        // rollback
        setLikedByMe(prev => ({ ...prev, [commentId]: false }))
        setLikeCountById(prev => ({ ...prev, [commentId]: Math.max(0, (prev[commentId] || 0) - 1) }))
        const j = await res.json().catch(() => null) as { error?: string } | null
        alert(`Beğeni kaydedilemedi: ${j?.error || res.statusText}`)
      }
    }
  }

  const submitReply = async () => {
    if (!userId) { window.location.href = '/auth/login'; return }
    if (!replyTo || !replyContent.trim()) return
    setReplySubmitting(true)
    try {
      const { error } = await supabase
        .from('article_comments')
        .insert({ article_id: articleId, user_id: userId, content: replyContent.trim(), parent_id: replyTo })
      if (error) throw error
      setReplyContent('')
      setReplyTo(null)
      const { data } = await supabase
        .from('article_comments')
        .select('id,article_id,user_id,content,parent_id,created_at')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true })
      setList(data || [])
    } finally {
      setReplySubmitting(false)
    }
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Comments ({list.length})</h3>
      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 mb-4 shadow-sm focus-within:ring-2 focus-within:ring-black/10">
        <div className="flex items-start gap-3">
          {userId ? (
            <Link href={`/u/${userId}`} className="shrink-0" aria-label="Profilime git">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userAvatar || undefined} />
                <AvatarFallback className="bg-gray-100 text-gray-700 text-xs">
                  {(userName?.charAt(0) || 'G').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-9 w-9">
              <AvatarImage src={userAvatar || undefined} />
              <AvatarFallback className="bg-gray-100 text-gray-700 text-xs">
                {(userName?.charAt(0) || 'G').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={userId ? 'Yorumunuzu yazın…' : 'Yorum yapmak için giriş yapın'}
              maxLength={maxLength}
              className="min-h-[90px] resize-y"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">{comment.length}/{maxLength}</span>
              <div className="flex items-center gap-2">
                {!userId ? (
                  <Button size="sm" asChild className="border border-gray-200 bg-white text-black hover:bg-gray-50">
                    <a href="/auth/login">Giriş yap</a>
                  </Button>
                ) : (
                  <Button size="sm" onClick={submit} disabled={submitting || !comment.trim()} className="border border-gray-200 bg-black text-white hover:bg-black/90">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gönderiliyor
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Gönder
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading && <div className="text-sm text-gray-500">Yükleniyor...</div>}
        {!loading && list.length === 0 && (
          <div className="text-sm text-gray-500">Henüz yorum yok.</div>
        )}
        {(() => {
          const byParent: Record<string, CommentRow[]> = {}
          const roots: CommentRow[] = []
          for (const c of list) {
            const pid = c.parent_id || null
            if (!pid) {
              roots.push(c)
            } else {
              if (!byParent[pid]) byParent[pid] = []
              byParent[pid].push(c)
            }
          }
          const renderItem = (r: CommentRow) => (
            <div key={r.id} className="rounded-xl border border-gray-200 p-3 sm:p-4 bg-white">
              <Link href={`/u/${r.user_id}`} className="flex items-center gap-3 text-sm text-gray-700 hover:opacity-90 transition" aria-label="Kullanıcı profiline git">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={profiles[r.user_id]?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gray-100 text-gray-700 text-[10px]">
                    {(profiles[r.user_id]?.full_name?.charAt(0) || profiles[r.user_id]?.username?.charAt(0) || 'K').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-xs text-gray-600 truncate">{profiles[r.user_id]?.full_name || profiles[r.user_id]?.username || 'Kullanıcı'}</div>
                  <div className="text-[11px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              </Link>
              <div className="mt-2 text-sm text-gray-800 whitespace-pre-line">{r.content}</div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  aria-label="Beğen"
                  aria-pressed={!!likedByMe[r.id]}
                  onClick={() => toggleLike(r.id)}
                  className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-colors ${likedByMe[r.id] ? 'text-red-600 bg-red-50 border-red-200' : 'text-gray-600 border-gray-200 hover:text-red-600 hover:bg-red-50 hover:border-red-200'}`}
                >
                  <Heart className={`h-3.5 w-3.5 transition-transform group-active:scale-95 ${likedByMe[r.id] ? 'fill-red-600' : 'fill-transparent'}`} />
                  <span>{(likeCountById[r.id] || 0).toLocaleString()}</span>
                </button>
                <button
                  type="button"
                  aria-label="Yanıtla"
                  onClick={() => { setReplyTo(r.id); setReplyContent('') }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-gray-600 transition-colors ${replyTo === r.id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <CornerUpRight className="h-3.5 w-3.5" />
                  <span>Yanıtla</span>
                </button>
              </div>
              {replyTo === r.id && (
                <div className="mt-3 pl-3 sm:pl-4 border-l border-gray-200">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={userAvatar || undefined} />
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-[10px]">{(userName?.charAt(0) || 'G').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        placeholder={userId ? 'Yanıtınızı yazın…' : 'Yanıtlamak için giriş yapın'}
                        maxLength={maxLength}
                        className="min-h-[70px]"
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <Button size="sm" onClick={submitReply} disabled={replySubmitting || !replyContent.trim()} className="border border-gray-200 bg-black text-white hover:bg-black/90">
                          {replySubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Gönderiliyor
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Gönder
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => { setReplyTo(null); setReplyContent('') }} className="border border-gray-200 bg-white text-black hover:bg-gray-50">İptal</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {byParent[r.id] && byParent[r.id].length > 0 && (
                <div className="mt-3 pl-3 sm:pl-4 border-l border-gray-200 space-y-3">
                  {byParent[r.id].map(child => (
                    <div key={child.id} className="">
                      {renderItem(child)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
          return roots.map(renderItem)
        })()}
      </div>
    </div>
  )
}


