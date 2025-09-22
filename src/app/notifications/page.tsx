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
  actor?: { id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null }
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
    let channelCleanup: (() => void) | undefined
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
      const actorIds = Array.from(new Set(((notifs as any[]) || []).map(n => n.payload?.actor_id || n.payload?.follower_id).filter(Boolean)))
      const storyIds = Array.from(new Set(((notifs as any[]) || []).map(n => n.payload?.story_id).filter(Boolean)))
      const commentIds = Array.from(new Set(((notifs as any[]) || []).map(n => n.payload?.comment_id).filter(Boolean)))

      let likers: Record<string, any> = {}
      let storiesMap: Record<string, any> = {}
      let commentsMap: Record<string, any> = {}
      let actors: Record<string, any> = {}
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
      if (actorIds.length) {
        const { data: ps } = await supabase.from('users_profiles').select('id,full_name,username,avatar_url').in('id', actorIds)
        for (const p of (ps || [])) actors[(p as any).id] = p
      }

      if (!mounted) return
      setNotifications(((notifs as any[]) || []).map((n: any) => ({
        ...n,
        liker: n.payload?.liker_id ? likers[n.payload.liker_id] : undefined,
        actor: n.payload?.actor_id ? actors[n.payload.actor_id] : (n.payload?.follower_id ? actors[n.payload.follower_id] : undefined),
        story: n.payload?.story_id ? storiesMap[n.payload.story_id] : undefined,
        comment: n.payload?.comment_id ? commentsMap[n.payload.comment_id] : undefined,
      })))
      setLoading(false)

      // Realtime subscribe for live notifications
      try { channelCleanup?.() } catch {}
      const channel = supabase
        .channel(`notifications-${u.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${u.id}` }, async (payload: { new: any; old: any }) => {
          const n: any = payload.new
          // Enrich minimal fields similar to initial load
          let liker: { id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null } | undefined
          let story: { id: string; slug?: string | null; title?: string | null } | undefined
          let comment: { id: string; content?: string | null } | undefined
          let actor: { id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null } | undefined
          try {
            if (n.payload?.liker_id) {
              const { data: ps } = await supabase.from('users_profiles').select('id,full_name,username,avatar_url').eq('id', n.payload.liker_id).single()
              if (ps) liker = ps as { id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null }
            }
            if (n.payload?.actor_id) {
              const { data: ps } = await supabase.from('users_profiles').select('id,full_name,username,avatar_url').eq('id', n.payload.actor_id).single()
              if (ps) actor = ps as { id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null }
            }
            if (n.payload?.follower_id) {
              const { data: ps } = await supabase.from('users_profiles').select('id,full_name,username,avatar_url').eq('id', n.payload.follower_id).single()
              if (ps) actor = ps as { id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null }
            }
            if (n.payload?.story_id) {
              const { data: ss } = await supabase.from('user_stories').select('id,slug,title').eq('id', n.payload.story_id).single()
              if (ss) story = ss as { id: string; slug?: string | null; title?: string | null }
            }
            if (n.payload?.comment_id) {
              const { data: cs } = await supabase.from('community_story_comments').select('id,content').eq('id', n.payload.comment_id).single()
              if (cs) comment = cs as { id: string; content?: string | null }
            }
          } catch {}
          setNotifications(prev => [{ ...n, liker, actor, story, comment }, ...prev])
        })
        .subscribe()
      channelCleanup = () => {
        try { channel.unsubscribe() } catch {}
      }
    }
    void load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => { void load() })
    return () => { mounted = false; sub.subscription.unsubscribe(); try { channelCleanup?.() } catch {} }
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
        const { count } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false)
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        const next = 0
        try { localStorage.setItem('unread_notifications', String(next)) } catch {}
        try {
          window.dispatchEvent(new CustomEvent('notifications:update', { detail: { count: next }}))
        } catch {}
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
                      {(() => {
                        const actorLike = n.liker || n.actor
                        if (actorLike?.avatar_url) {
                          return (
                            <Link href={`/u/${actorLike.id}`}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={actorLike.avatar_url} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                            </Link>
                          )
                        }
                        return (
                          <div className={`h-10 w-10 rounded-full border flex items-center justify-center ${n.type === 'comment_like' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                            {n.type === 'comment_like' ? <Heart className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                          </div>
                        )
                      })()}
                      <div className="flex-1 min-w-0">
                        {n.type === 'comment_like' ? (
                          <div className="text-sm text-gray-900">
                            <Link href={`/u/${(n.liker || n.actor)?.id || ''}`} className="font-semibold hover:underline">{(n.liker || n.actor)?.full_name || (n.liker || n.actor)?.username || 'Bir kullanıcı'}</Link> yorumunu beğendi.
                            {n.story?.slug && (<><Link href={`/community/stories/${n.story.slug}`} className="underline ml-1">Hikayeyi gör</Link></>)}
                          </div>
                        ) : n.type === 'story_like' ? (
                          <div className="text-sm text-gray-900">
                            <Link href={`/u/${n.actor?.id || ''}`} className="font-semibold hover:underline">{n.actor?.full_name || n.actor?.username || 'Bir kullanıcı'}</Link> hikayeni beğendi.
                            {n.story?.slug && (<><Link href={`/community/stories/${n.story.slug}`} className="underline ml-1">Hikayeyi gör</Link></>)}
                          </div>
                        ) : n.type === 'story_comment' ? (
                          <div className="text-sm text-gray-900">
                            <Link href={`/u/${n.actor?.id || ''}`} className="font-semibold hover:underline">{n.actor?.full_name || n.actor?.username || 'Bir kullanıcı'}</Link> hikayene yorum yaptı.
                            {n.story?.slug && (<><Link href={`/community/stories/${n.story.slug}`} className="underline ml-1">Hikayeyi gör</Link></>)}
                          </div>
                        ) : n.type === 'comment_reply' ? (
                          <div className="text-sm text-gray-900">
                            <Link href={`/u/${n.actor?.id || ''}`} className="font-semibold hover:underline">{n.actor?.full_name || n.actor?.username || 'Bir kullanıcı'}</Link> yorumuna yanıt verdi.
                            {n.story?.slug && (<><Link href={`/community/stories/${n.story.slug}`} className="underline ml-1">Hikayeyi gör</Link></>)}
                          </div>
                        ) : n.type === 'follow' ? (
                          <div className="text-sm text-gray-900">
                            <Link href={`/u/${n.actor?.id || ''}`} className="font-semibold hover:underline">{n.actor?.full_name || n.actor?.username || 'Bir kullanıcı'}</Link> seni takip etmeye başladı.
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
                      {(() => {
                        const actorLike = n.liker || n.actor
                        if (actorLike?.avatar_url) {
                          return (
                            <Link href={`/u/${actorLike.id}`}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={actorLike.avatar_url} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                            </Link>
                          )
                        }
                        return (
                          <div className={`h-10 w-10 rounded-full border flex items-center justify-center ${n.type === 'comment_like' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                            {n.type === 'comment_like' ? <Heart className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                          </div>
                        )
                      })()}
                      <div className="flex-1 min-w-0">
                        {n.type === 'comment_like' ? (
                          <div className="text-sm text-gray-900">
                            <Link href={`/u/${(n.liker || n.actor)?.id || ''}`} className="font-semibold hover:underline">{(n.liker || n.actor)?.full_name || (n.liker || n.actor)?.username || 'Bir kullanıcı'}</Link> yorumunu beğendi.
                            {n.story?.slug && (<><Link href={`/community/stories/${n.story.slug}`} className="underline ml-1">Hikayeyi gör</Link></>)}
                          </div>
                        ) : n.type === 'story_like' ? (
                          <div className="text-sm text-gray-900">
                            <Link href={`/u/${n.actor?.id || ''}`} className="font-semibold hover:underline">{n.actor?.full_name || n.actor?.username || 'Bir kullanıcı'}</Link> hikayeni beğendi.
                            {n.story?.slug && (<><Link href={`/community/stories/${n.story.slug}`} className="underline ml-1">Hikayeyi gör</Link></>)}
                          </div>
                        ) : n.type === 'story_comment' ? (
                          <div className="text-sm text-gray-900">
                            <Link href={`/u/${n.actor?.id || ''}`} className="font-semibold hover:underline">{n.actor?.full_name || n.actor?.username || 'Bir kullanıcı'}</Link> hikayene yorum yaptı.
                            {n.story?.slug && (<><Link href={`/community/stories/${n.story.slug}`} className="underline ml-1">Hikayeyi gör</Link></>)}
                          </div>
                        ) : n.type === 'comment_reply' ? (
                          <div className="text-sm text-gray-900">
                            <Link href={`/u/${n.actor?.id || ''}`} className="font-semibold hover:underline">{n.actor?.full_name || n.actor?.username || 'Bir kullanıcı'}</Link> yorumuna yanıt verdi.
                            {n.story?.slug && (<><Link href={`/community/stories/${n.story.slug}`} className="underline ml-1">Hikayeyi gör</Link></>)}
                          </div>
                        ) : n.type === 'follow' ? (
                          <div className="text-sm text-gray-900">
                            <Link href={`/u/${n.actor?.id || ''}`} className="font-semibold hover:underline">{n.actor?.full_name || n.actor?.username || 'Bir kullanıcı'}</Link> seni takip etmeye başladı.
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


