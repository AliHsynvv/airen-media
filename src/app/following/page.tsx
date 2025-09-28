'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ProfileLite {
  id: string
  full_name?: string | null
  username?: string | null
  avatar_url?: string | null
}

export default function FollowingPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState<ProfileLite[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      setUserId(u?.id || null)
      if (!u?.id) { setLoading(false); return }

      // ids I am following
      const { data: rows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', u.id)
        .limit(500)
      const ids = (rows || []).map((r: any) => r.following_id)
      if (!ids.length) { setFollowing([]); setLoading(false); return }

      const { data: profiles } = await supabase
        .from('users_profiles')
        .select('id,full_name,username,avatar_url')
        .in('id', ids)

      setFollowing((profiles || []) as any[])
      setLoading(false)
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => { sub.subscription.unsubscribe() }
  }, [])

  const unfollow = async (targetId: string) => {
    if (!userId) return
    await supabase.from('user_follows').delete().eq('follower_id', userId).eq('following_id', targetId)
    setFollowing(prev => prev.filter(p => p.id !== targetId))
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/profile" className="text-xl leading-none text-gray-900">×</Link>
        <div className="text-lg font-semibold text-gray-900">Following</div>
        <div className="w-5" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="h-16 rounded-lg border border-gray-200 bg-white animate-pulse" />))}
        </div>
      ) : following.length ? (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {following.map(p => (
            <li key={p.id} className="px-3 sm:px-4 py-3">
              <div className="flex items-center gap-3">
                <Link href={`/u/${p.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  { }
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">{(p.full_name || p.username || 'U')[0]}</div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{p.full_name || p.username || 'User'}</div>
                    <div className="text-xs text-gray-600 truncate">@{p.username || p.id.slice(0,6)}</div>
                  </div>
                </Link>
                <Button
                  className="h-8 px-4 rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200"
                  onClick={() => unfollow(p.id)}
                >
                  Unfollow
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-600">You are not following anyone yet.</div>
      )}
    </div>
  )
}


