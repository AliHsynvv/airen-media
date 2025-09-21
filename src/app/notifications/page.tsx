'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bell, Heart, MessageCircle, Search } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/formatters'

type Notif = {
  id: string
  type: string
  payload: any
  created_at: string
  is_read: boolean
  liker?: { id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null }
  story?: { id: string; slug?: string | null; title?: string | null }
  comment?: { id: string; content?: string | null }
}

export default function NotificationsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notif[]>([])
  const autoClearedRef = useRef(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      setUserId(u?.id || null)
      if (!u?.id) { setLoading(false); return }

      const { data: notifs } = await supabase
        .from('notifications')
        .select('id,type,payload,created_at,is_read')
        .order('created_at', { ascending: false })
        .limit(100)

      const likerIds = Array.from(new Set(((notifs as any[]) || []).map(n => n.payload?.liker_id).filter(Boolean)))
      const storyIds = Array.from(new Set(((notifs as any[]) || []).map(n => n.payload?.story_id).filter(Boolean)))
      const commentIds = Array.from(new Set(((notifs as any[]) || []).map(n => n.payload?.comment_id).filter(Boolean)))

      let likers: Record<string, any> = {}
      let storiesMap: Record<string, any> = {}
      let commentsMap: Record<string, any> = {}
      if (likerIds.length) {
        const { data: ps } = await supabase.from('users_profiles').select('id,full_name,username,avatar_url').in('id', likerIds)
        for (const p of (ps || [])) likers[(p as any).id] = p
      }
      if (storyIds.length) {
        const { data: ss } = await supabase.from('user_stories').select('id,slug,title').in('id', storyIds)
        for (const s of (ss || [])) storiesMap[(s as any).id] = s
      }
      if (commentIds.length) {
        const { data: cs } = await supabase.from('community_story_comments').select('id,content').in('id', commentIds)
        for (const c of (cs || [])) commentsMap[(c as any).id] = c
      }

      if (!mounted) return
      setNotifications(((notifs as any[]) || []).map((n: any) => ({
        ...n,
        liker: n.payload?.liker_id ? likers[n.payload.liker_id] : undefined,
        story: n.payload?.story_id ? storiesMap[n.payload.story_id] : undefined,
        comment: n.payload?.comment_id ? commentsMap[n.payload.comment_id] : undefined,
      })))
      setLoading(false)

      // Realtime subscribe for live notifications
      const channel = supabase
        .channel(`notifications-${u.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${u.id}` }, async (payload) => {
          const n: any = payload.new
          // Enrich minimal fields similar to initial load
          let liker, story, comment
          try {
            if (n.payload?.liker_id) {
              const { data: ps } = await supabase.from('users_profiles').select('id,full_name,username,avatar_url').eq('id', n.payload.liker_id).single()
              liker = ps
            }
            if (n.payload?.story_id) {
              const { data: ss } = await supabase.from('user_stories').select('id,slug,title').eq('id', n.payload.story_id).single()
              story = ss
            }
            if (n.payload?.comment_id) {
              const { data: cs } = await supabase.from('community_story_comments').select('id,content').eq('id', n.payload.comment_id).single()
              comment = cs
            }
          } catch {}
          setNotifications(prev => [{ ...n, liker, story, comment }, ...prev])
        })
        .subscribe()

      return () => {
        try { channel.unsubscribe() } catch {}
      }
    }
    const cleanup = load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => { mounted = false; sub.subscription.unsubscribe(); try { (cleanup as any)?.() } catch {} }
  }, [])

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications])
  const unread = useMemo(() => notifications.filter(n => !n.is_read), [notifications])
  const earlier = useMemo(() => notifications.filter(n => n.is_read), [notifications])

  // Auto-mark all as read when visiting the page once
  useEffect(() => {
    const markAllRead = async () => {
      if (!userId) return
      if (autoClearedRef.current) return
      const hasUnread = notifications.some(n => !n.is_read)
      if (!hasUnread) return
      autoClearedRef.current = true
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      } catch {}
    }
    markAllRead()
  }, [userId, notifications])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
        <button className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : notifications.length ? (
        <div className="bg-white rounded-lg border border-gray-200">
          {!!unread.length && (
            <div className="px-4 py-3">
              <div className="text-sm font-semibold text-gray-900 mb-2">New</div>
              <ul className="space-y-3">
                {unread.map(n => (
                  <li key={n.id} className="">
                    <div className="flex items-start gap-3">
                      {n.type === 'comment_like' && n.liker?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.liker.avatar_url} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className={`h-10 w-10 rounded-full border flex items-center justify-center ${n.type === 'comment_like' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                          {n.type === 'comment_like' ? <Heart className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
              {n.type === 'comment_like' ? (
                          <div className="text-sm text-gray-900">
                            <span className="font-semibold">{n.liker?.full_name || n.liker?.username || 'Bir kullanıcı'}</span> yorumunu beğendi.
                            {n.story?.slug && (
                              <> <Link href={`/community/stories/${n.story.slug}`} className="underline">Hikayeyi gör</Link></>
                            )}
                          </div>
              ) : n.type === 'story_like' ? (
                <div className="text-sm text-gray-900">
                  <span className="font-semibold">{n.liker?.full_name || n.liker?.username || 'Bir kullanıcı'}</span> hikayeni beğendi.
                  {n.story?.slug && (
                    <> <Link href={`/community/stories/${n.story.slug}`} className="underline">Hikayeyi gör</Link></>
                  )}
                </div>
              ) : n.type === 'story_comment' ? (
                <div className="text-sm text-gray-900">
                  <span className="font-semibold">{n.liker?.full_name || n.liker?.username || 'Bir kullanıcı'}</span> hikayene yorum yaptı.
                  {n.story?.slug && (
                    <> <Link href={`/community/stories/${n.story.slug}`} className="underline">Hikayeyi gör</Link></>
                  )}
                </div>
              ) : n.type === 'comment_reply' ? (
                <div className="text-sm text-gray-900">
                  <span className="font-semibold">{n.liker?.full_name || n.liker?.username || 'Bir kullanıcı'}</span> yorumuna yanıt verdi.
                  {n.story?.slug && (
                    <> <Link href={`/community/stories/${n.story.slug}`} className="underline">Hikayeyi gör</Link></>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-900">Bildirim</div>
              )}
                        <div className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(n.created_at)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!earlier.length && (
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-900 mb-2">Earlier</div>
              <ul className="space-y-3">
                {earlier.map(n => (
                  <li key={n.id} className="">
                    <div className="flex items-start gap-3">
                      {n.type === 'comment_like' && n.liker?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.liker.avatar_url} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className={`h-10 w-10 rounded-full border flex items-center justify-center ${n.type === 'comment_like' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                          {n.type === 'comment_like' ? <Heart className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {n.type === 'comment_like' ? (
                          <div className="text-sm text-gray-900">
                            <span className="font-semibold">{n.liker?.full_name || n.liker?.username || 'Bir kullanıcı'}</span> yorumunu beğendi.
                            {n.story?.slug && (
                              <> <Link href={`/community/stories/${n.story.slug}`} className="underline">Hikayeyi gör</Link></>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900">Bildirim</div>
                        )}
                        <div className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(n.created_at)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-600">Bildirim yok.</div>
      )}
    </div>
  )
}


