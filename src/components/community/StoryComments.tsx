'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface StoryCommentsProps {
  storyId: string
  variant?: 'default' | 'minimal'
  onSubmitted?: () => void
}

interface CommentRow {
  id: string
  story_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  user?: { id: string; full_name: string | null; username: string | null; avatar_url: string | null }
  like_count?: number
  liked_by_me?: boolean
}

type ProfileRow = { id: string; full_name: string | null; username: string | null; avatar_url: string | null }

export default function StoryComments({ storyId, variant = 'default', onSubmitted }: StoryCommentsProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const isUuid = useMemo(() => typeof storyId === 'string' && /^[0-9a-fA-F-]{36}$/.test(storyId), [storyId])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data: u } = await supabase.auth.getUser()
      setUserId(u.user?.id ?? null)
      if (!isUuid) { setComments([]); return }
      const { data } = await supabase
        .from('community_story_comments')
        .select('id,story_id,user_id,content,parent_id,created_at')
        .eq('story_id', storyId)
        .order('created_at', { ascending: true })
      const ids = Array.from(new Set((data || []).map(d => d.user_id)))
      const users: Record<string, ProfileRow> = {}
      if (ids.length) {
        const { data: profs } = await supabase.from('users_profiles').select('id,full_name,username,avatar_url').in('id', ids)
        for (const p of ((profs || []) as ProfileRow[])) users[p.id] = p
      }
      // likes
      const cids = (data || []).map(d => d.id)
      const byId: Record<string, { count: number; me: boolean }> = {}
      if (cids.length) {
        const likesRes = await supabase.from('community_comment_likes').select('comment_id,user_id').in('comment_id', cids)
        const counts: Record<string, number> = {}
        const mineSet = new Set<string>()
        for (const row of (likesRes.data || [])) {
          const cid = row.comment_id as string
          counts[cid] = (counts[cid] || 0) + 1
          if (row.user_id === u.user?.id) mineSet.add(cid)
        }
        for (const id of cids) byId[id] = { count: counts[id] || 0, me: mineSet.has(id) }
      }
      if (mounted) setComments(((data || []) as CommentRow[]).map(r => ({ ...r, user: users[r.user_id], like_count: byId[r.id]?.count || 0, liked_by_me: byId[r.id]?.me || false })))
    }
    load()
    return () => { mounted = false }
  }, [storyId, isUuid])

  const submit = async () => {
    if (!userId) { window.location.href = '/auth/login'; return }
    if (!isUuid || !content.trim()) return
    setBusy(true)
    try {
      const { data: inserted, error } = await supabase
        .from('community_story_comments')
        .insert({ story_id: storyId, user_id: userId, content: content.trim(), parent_id: replyTo })
        .select('id, parent_id, user_id')
        .single()
      if (!error) {
        // Notifications: reply and top-level comment
        try {
          if (replyTo) {
            const { data: parent } = await supabase
              .from('community_story_comments')
              .select('user_id')
              .eq('id', replyTo)
              .single()
            if (parent?.user_id && parent.user_id !== userId) {
            await fetch('/api/notifications/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: parent.user_id, type: 'comment_reply', payload: { story_id: storyId, comment_id: inserted?.id, parent_id: replyTo } }) })
            }
          } else {
            // notify story owner
            const { data: story } = await supabase.from('user_stories').select('user_id').eq('id', storyId).single()
            if (story?.user_id && story.user_id !== userId) {
            await fetch('/api/notifications/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: story.user_id, type: 'story_comment', payload: { story_id: storyId, comment_id: inserted?.id } }) })
            }
          }
        } catch {}
        setContent('')
        setReplyTo(null)
        const { data } = await supabase
          .from('community_story_comments')
          .select('id,story_id,user_id,content,parent_id,created_at')
          .eq('story_id', storyId)
          .order('created_at', { ascending: true })
        const ids = Array.from(new Set((data || []).map(d => d.user_id)))
        const users: Record<string, ProfileRow> = {}
        if (ids.length) {
          const { data: profs } = await supabase.from('users_profiles').select('id,full_name,username,avatar_url').in('id', ids)
          for (const p of ((profs || []) as ProfileRow[])) users[p.id] = p
        }
        setComments(((data || []) as CommentRow[]).map(r => ({ ...r, user: users[r.user_id] })))
        onSubmitted?.()
      }
    } finally {
      setBusy(false)
    }
  }

  const tree = useMemo(() => {
    const byParent: Record<string, CommentRow[]> = {}
    for (const c of comments) {
      const key = c.parent_id || 'root'
      ;(byParent[key] ||= []).push(c)
    }
    return byParent
  }, [comments])

  const toggleLike = async (c: CommentRow) => {
    if (!userId) { window.location.href = '/auth/login'; return }
    const liked = !!c.liked_by_me
    if (liked) {
      await supabase.from('community_comment_likes').delete().eq('comment_id', c.id).eq('user_id', userId)
      setComments(prev => prev.map(x => x.id === c.id ? { ...x, liked_by_me: false, like_count: Math.max(0, (x.like_count || 0) - 1) } : x))
    } else {
      await supabase.from('community_comment_likes').upsert({ comment_id: c.id, user_id: userId }, { onConflict: 'comment_id,user_id', ignoreDuplicates: true })
      setComments(prev => prev.map(x => x.id === c.id ? { ...x, liked_by_me: true, like_count: (x.like_count || 0) + 1 } : x))
      try {
        if (c.user_id !== userId) {
          await fetch('/api/notifications/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: c.user_id, type: 'comment_like', payload: { comment_id: c.id, story_id: c.story_id } }) })
        }
      } catch {}
    }
  }

  const Item = ({ c }: { c: CommentRow }) => (
    <div className="flex gap-3 py-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={c.user?.avatar_url || undefined} />
        <AvatarFallback>{(c.user?.full_name || c.user?.username || 'U').slice(0,1)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="text-sm text-gray-900 font-medium">{c.user?.full_name || c.user?.username || 'Kullanıcı'}</div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</div>
        <div className="mt-1 flex items-center gap-3">
          <button className="text-xs text-gray-600 hover:text-black" onClick={() => { setReplyTo(c.id); textareaRef.current?.focus() }}>Yanıtla</button>
          <button className={`text-xs ${c.liked_by_me ? 'text-red-600' : 'text-gray-600 hover:text-black'}`} onClick={() => toggleLike(c)}>
            {c.liked_by_me ? 'Beğenildi' : 'Beğen'} ({c.like_count || 0})
          </button>
        </div>
        {tree[c.id]?.length ? (
          <div className="mt-2 pl-6 border-l border-gray-200">
            {tree[c.id].map(cc => <Item key={cc.id} c={cc} />)}
          </div>
        ) : null}
      </div>
    </div>
  )

  const isMinimal = variant === 'minimal'

  return (
    <div id="comments" className={isMinimal ? 'p-0' : 'rounded-xl border border-gray-200 bg-white p-4'}>
      {!isMinimal && <h3 className="text-black font-semibold mb-3">Yorumlar</h3>}
      <div>
        {(tree['root'] || []).map(c => <Item key={c.id} c={c} />)}
      </div>
      <div className={isMinimal ? 'mt-3 sticky bottom-0 bg-white pt-2 pb-3' : 'mt-4'}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={replyTo ? 'Yanıt yaz…' : 'Yorum yaz…'}
          className={isMinimal ? 'w-full h-24 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 p-3 focus:outline-none focus:ring-2 focus:ring-black/10' : 'w-full h-24 rounded-md border border-gray-200 bg-white text-gray-900 p-2'}
        />
        {replyTo && (
          <div className="text-xs text-gray-500 mt-1">Yanıtlanan: #{replyTo.slice(0,6)} <button className="ml-2 underline" onClick={() => setReplyTo(null)}>iptal</button></div>
        )}
        <div className="mt-2 flex justify-end">
          <Button onClick={submit} disabled={busy || !content.trim()} className={isMinimal ? 'rounded-full bg-black text-white hover:bg-black/90 px-5' : 'bg-black text-white hover:bg-black/90'}>
            Gönder
          </Button>
        </div>
      </div>
    </div>
  )
}


