'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bell, Heart, MessageCircle } from 'lucide-react'
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
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bildirimler</h1>
          <div className="text-sm text-gray-600">{unreadCount} okunmamış</div>
        </div>
        {!!unreadCount && (
          <Button
            variant="secondary"
            className="h-9 px-4 border border-gray-200 bg-white text-black hover:bg-gray-50"
            onClick={async () => {
              if (!userId) return
              await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
              setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            }}
          >
            Tümünü okundu yap
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : notifications.length ? (
        <ul className="divide-y divide-gray-200 bg-white rounded-lg border border-gray-200">
          {notifications.map(n => (
            <li key={n.id} className={`px-4 py-3 ${!n.is_read ? 'bg-gray-50' : ''}`}>
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
                      <span className="font-medium">{n.liker?.full_name || n.liker?.username || 'Bir kullanıcı'}</span> yorumunu beğendi.
                      {n.story?.slug && (
                        <> <Link href={`/community/stories/${n.story.slug}`} className="underline">Hikayeyi gör</Link></>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900">Bildirim</div>
                  )}
                  {n.type === 'comment_like' && n.comment?.content && (
                    <div className="mt-2 text-xs text-gray-700 border border-gray-200 bg-gray-50 rounded-md p-2 line-clamp-3">{n.comment.content}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{formatRelativeTime(n.created_at)}</div>
                </div>
                {!n.is_read && (
                  <Button
                    variant="secondary"
                    className="h-8 px-3 border border-gray-200 bg-white text-black hover:bg-gray-50"
                    onClick={async () => {
                      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id)
                      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
                    }}
                  >
                    Okundu
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-600">Bildirim yok.</div>
      )}
    </div>
  )
}


