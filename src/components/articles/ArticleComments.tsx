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
      {/* Modern Comments Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="h-10 w-1.5 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
          <h3 className="text-3xl sm:text-4xl font-black text-gray-900">
            Yorumlar
          </h3>
          <span className="inline-flex items-center justify-center h-8 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg">
            {list.length}
          </span>
        </div>
        <p className="text-gray-600 ml-6">Düşüncelerinizi paylaşın</p>
      </div>

      {/* Modern Comment Input */}
      <div className="rounded-3xl border-2 border-gray-100 bg-white shadow-xl p-4 sm:p-6 mb-8 focus-within:ring-4 focus-within:ring-indigo-100 transition-all duration-300">
        <div className="flex items-start gap-4">
          {userId ? (
            <Link href={`/u/${userId}`} className="shrink-0" aria-label="Profilime git">
              <Avatar className="h-12 w-12 ring-2 ring-gray-100 hover:ring-indigo-600 transition-all">
                <AvatarImage src={userAvatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm">
                  {(userName?.charAt(0) || 'G').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-12 w-12 ring-2 ring-gray-200">
              <AvatarImage src={userAvatar || undefined} />
              <AvatarFallback className="bg-gray-200 text-gray-600 font-bold text-sm">
                {(userName?.charAt(0) || 'G').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={userId ? 'Yorumunuzu yazın… (Ctrl+Enter ile gönderin)' : 'Yorum yapmak için giriş yapın'}
              maxLength={maxLength}
              className="min-h-[100px] resize-y border-2 border-gray-200 focus:border-indigo-500 rounded-2xl text-base"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">{comment.length}/{maxLength}</span>
              <div className="flex items-center gap-2">
                {!userId ? (
                  <Button size="sm" asChild className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 font-semibold">
                    <a href="/auth/login">Giriş yap</a>
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={submit} 
                    disabled={submitting || !comment.trim()} 
                    className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed px-6 font-semibold"
                  >
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
            {error && <div className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl font-medium">{error}</div>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Yorumlar yükleniyor...</p>
          </div>
        )}
        {!loading && list.length === 0 && (
          <div className="text-center py-16 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Henüz yorum yok</h4>
            <p className="text-sm text-gray-600">İlk yorumu yapan siz olun!</p>
          </div>
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
            <div key={r.id} className="rounded-2xl border-2 border-gray-100 p-4 sm:p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href={`/u/${r.user_id}`} className="flex items-center gap-4 text-sm group" aria-label="Kullanıcı profiline git">
                <Avatar className="h-11 w-11 ring-2 ring-gray-100 group-hover:ring-indigo-600 transition-all">
                  <AvatarImage src={profiles[r.user_id]?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm">
                    {(profiles[r.user_id]?.full_name?.charAt(0) || profiles[r.user_id]?.username?.charAt(0) || 'K').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                    {profiles[r.user_id]?.full_name || profiles[r.user_id]?.username || 'Kullanıcı'}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {new Date(r.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </Link>
              <div className="mt-4 text-base text-gray-800 leading-relaxed whitespace-pre-line">{r.content}</div>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <button
                  type="button"
                  aria-label="Beğen"
                  aria-pressed={!!likedByMe[r.id]}
                  onClick={() => toggleLike(r.id)}
                  className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow-md transition-all duration-300 ${
                    likedByMe[r.id] 
                      ? 'text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                      : 'text-gray-700 bg-gray-100 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white'
                  }`}
                >
                  <Heart className={`h-4 w-4 transition-transform group-active:scale-125 ${likedByMe[r.id] ? 'fill-white' : 'fill-transparent'}`} />
                  <span>{(likeCountById[r.id] || 0).toLocaleString()}</span>
                </button>
                <button
                  type="button"
                  aria-label="Yanıtla"
                  onClick={() => { setReplyTo(r.id); setReplyContent('') }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow-md transition-all duration-300 ${
                    replyTo === r.id 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white'
                  }`}
                >
                  <CornerUpRight className="h-4 w-4" />
                  <span>Yanıtla</span>
                </button>
              </div>
              {replyTo === r.id && (
                <div className="mt-6 pl-4 sm:pl-6 border-l-4 border-indigo-600">
                  <div className="flex items-start gap-3 bg-indigo-50/50 rounded-2xl p-4">
                    <Avatar className="h-10 w-10 ring-2 ring-indigo-200">
                      <AvatarImage src={userAvatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs">
                        {(userName?.charAt(0) || 'G').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        placeholder={userId ? 'Yanıtınızı yazın…' : 'Yanıtlamak için giriş yapın'}
                        maxLength={maxLength}
                        className="min-h-[80px] border-2 border-indigo-200 focus:border-indigo-500 rounded-xl bg-white"
                      />
                      <div className="mt-3 flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={submitReply} 
                          disabled={replySubmitting || !replyContent.trim()} 
                          className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-5 font-semibold"
                        >
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
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => { setReplyTo(null); setReplyContent('') }} 
                          className="rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 px-5 font-semibold"
                        >
                          İptal
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {byParent[r.id] && byParent[r.id].length > 0 && (
                <div className="mt-6 pl-4 sm:pl-6 border-l-4 border-gray-200 space-y-4">
                  {byParent[r.id].map(child => (
                    <div key={child.id} className="relative">
                      <div className="absolute -left-4 sm:-left-6 top-6 w-4 sm:w-6 h-px bg-gray-200"></div>
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


