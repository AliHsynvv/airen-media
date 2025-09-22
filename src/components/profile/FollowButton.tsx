'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

interface Props {
  profileId: string
  className?: string
}

export default function FollowButton({ profileId, className }: Props) {
  const [userId, setUserId] = useState<string | null>(null)
  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const uid = data.user?.id ?? null
      if (!mounted) return
      setUserId(uid)
      if (uid && uid !== profileId) {
        const { data: f } = await supabase
          .from('user_follows')
          .select('follower_id')
          .eq('follower_id', uid)
          .eq('following_id', profileId)
          .maybeSingle()
        setFollowing(!!f)
      } else {
        setFollowing(false)
      }
      setInitialized(true)
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [profileId])

  useEffect(() => {
    if (!userId || !profileId || userId === profileId) return
    const channel = supabase
      .channel(`follow-${userId}-${profileId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_follows', filter: `follower_id=eq.${userId}` }, (payload: any) => {
        if (payload?.new?.following_id === profileId) setFollowing(true)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'user_follows', filter: `follower_id=eq.${userId}` }, (payload: any) => {
        if (payload?.old?.following_id === profileId) setFollowing(false)
      })
      .subscribe()
    return () => { try { channel.unsubscribe() } catch {} }
  }, [userId, profileId])

  const toggle = async () => {
    if (!userId) { window.location.href = '/auth/login'; return }
    if (userId === profileId) return
    setBusy(true)
    try {
      if (following) {
        await supabase.from('user_follows').delete().eq('follower_id', userId).eq('following_id', profileId)
        setFollowing(false)
      } else {
        await supabase.from('user_follows').insert({ follower_id: userId, following_id: profileId })
        setFollowing(true)
        // notify the followed user (avoid self)
        try {
          await supabase.from('notifications').insert({ user_id: profileId, type: 'follow', payload: { actor_id: userId } })
        } catch {}
      }
    } finally {
      setBusy(false)
    }
  }

  if (!initialized) return null
  if (userId === profileId) return null

  return (
    <Button
      variant="secondary"
      aria-label={following ? 'Takiptesin' : 'Takip Et'}
      className={[
        'h-8 sm:h-9 px-3 sm:px-4 text-sm rounded-full transition-colors',
        'border shadow-none',
        following
          ? 'bg-black text-white hover:bg-black/90 border-black/20'
          : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-200',
        className || ''
      ].join(' ')}
      disabled={busy}
      onClick={toggle}
    >
      {following ? 'Takiptesin' : 'Takip Et'}
    </Button>
  )
}


