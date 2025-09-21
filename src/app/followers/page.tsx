'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ProfileLite {
  id: string
  full_name?: string | null
  username?: string | null
  avatar_url?: string | null
}

export default function FollowersPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [followers, setFollowers] = useState<Array<ProfileLite & { isFollowingBack: boolean }>>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      setUserId(u?.id || null)
      if (!u?.id) { setLoading(false); return }

      // fetch follower ids
      const { data: f } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', u.id)
        .limit(500)
      const followerIds = (f || []).map((r: any) => r.follower_id)
      if (!followerIds.length) { setFollowers([]); setLoading(false); return }

      const { data: profiles } = await supabase
        .from('users_profiles')
        .select('id,full_name,username,avatar_url')
        .in('id', followerIds)

      const { data: myFollowing } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', u.id)
      const myFollowingSet = new Set(((myFollowing || []) as any[]).map(r => r.following_id))

      setFollowers(((profiles || []) as any[]).map(p => ({ ...(p as any), isFollowingBack: myFollowingSet.has((p as any).id) })))
      setLoading(false)
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => { sub.subscription.unsubscribe() }
  }, [])

  const toggleFollow = async (targetId: string, currentlyFollowing: boolean) => {
    if (!userId) return
    if (currentlyFollowing) {
      await supabase.from('user_follows').delete().eq('follower_id', userId).eq('following_id', targetId)
      setFollowers(prev => prev.map(p => p.id === targetId ? { ...p, isFollowingBack: false } : p))
    } else {
      await supabase.from('user_follows').insert({ follower_id: userId, following_id: targetId })
      setFollowers(prev => prev.map(p => p.id === targetId ? { ...p, isFollowingBack: true } : p))
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/profile" className="text-xl leading-none text-gray-900">×</Link>
        <div className="text-lg font-semibold text-gray-900">Followers</div>
        <div className="w-5" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="h-16 rounded-lg border border-gray-200 bg-white animate-pulse" />))}
        </div>
      ) : followers.length ? (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {followers.map(p => (
            <li key={p.id} className="px-3 sm:px-4 py-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">{(p.full_name || p.username || 'U')[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{p.full_name || p.username || 'User'}</div>
                  <div className="text-xs text-gray-600 truncate">@{p.username || p.id.slice(0,6)}</div>
                </div>
                <Button
                  className={`h-8 px-4 rounded-full ${p.isFollowingBack ? 'bg-blue-600 text-white hover:bg-blue-600' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                  onClick={() => toggleFollow(p.id, p.isFollowingBack)}
                >
                  {p.isFollowingBack ? 'Following' : 'Follow'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-600">No followers yet.</div>
      )}
    </div>
  )
}


