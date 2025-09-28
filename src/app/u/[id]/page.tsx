import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/server'
import EnlargeableAvatar from '@/components/common/EnlargeableAvatar'
// import StoryCard from '@/components/community/StoryCard'
import FollowButton from '@/components/profile/FollowButton'
import { Button } from '@/components/ui/button'
import { Users, User as UserIcon /*, Search*/ } from 'lucide-react'
import UserSearchPopover from '@/components/profile/UserSearchPopover'
import { getServerSupabase } from '@/lib/supabase/server-ssr'
import MutualConnections from '@/components/profile/MutualConnections'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ id: string }>
}

export default async function PublicUserProfilePage(context: Props) {
  const { id } = await context.params
  let isSelf = false
  // If this is the current user's own id, redirect to private profile page
  try {
    const supabase = await getServerSupabase()
    const { data: sessionRes } = await supabase.auth.getSession()
    const meId = sessionRes.session?.user?.id || null
    if (meId && meId === id) {
      redirect('/profile')
    }
    // Keep isSelf flag to hide Follow button if needed (in case redirect conditions change)
    isSelf = !!meId && meId === id
  } catch {}
  const { data: profile } = await supabaseAdmin
    .from('users_profiles')
    .select('id,full_name,username,avatar_url,bio,created_at')
    .eq('id', id)
    .single()

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-gray-700">Kullanıcı bulunamadı.</div>
      </div>
    )
  }

  const storiesRes = await supabaseAdmin
    .from('user_stories')
    .select('id,title,slug,image_url,image_alt,category,tags,created_at, users_profiles:users_profiles!user_stories_user_id_fkey(id,full_name,username,avatar_url)')
    .eq('user_id', profile.id)
    .in('status', ['approved','featured'])
    .order('created_at', { ascending: false })
    .limit(200)
  const stories = storiesRes.data ?? []

  // counts
  const [{ count: followers = 0 }, { count: following = 0 }] = await Promise.all([
    supabaseAdmin.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabaseAdmin.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
  ])

  // Mutual connections and suggestions
  let mutuals: Array<{ id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null }> = []
  let suggestions: Array<{ id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null; followers_count?: number; mutual_count?: number }> = []
  try {
    const supabase = await getServerSupabase()
    const { data: s } = await supabase.auth.getSession()
    const meId = s.session?.user?.id || null
    if (meId && meId !== profile.id) {
      const [myFollowingRes, theirFollowingRes] = await Promise.all([
        supabaseAdmin.from('user_follows').select('following_id').eq('follower_id', meId).limit(1000),
        supabaseAdmin.from('user_follows').select('following_id').eq('follower_id', profile.id).limit(1000),
      ])
      type FollowRow = { following_id: string }
      const mySet = new Set(((myFollowingRes.data || []) as FollowRow[]).map((r) => r.following_id))
      const theirSet = new Set(((theirFollowingRes.data || []) as FollowRow[]).map((r) => r.following_id))
      const commonIds: string[] = []
      for (const id of mySet) { if (theirSet.has(id)) commonIds.push(id) }
      if (commonIds.length) {
        const { data: mprofiles } = await supabaseAdmin
          .from('users_profiles')
          .select('id,full_name,username,avatar_url')
          .in('id', commonIds.slice(0, 12))
        mutuals = (mprofiles || []) as any
      }

      // Discover people: pick popular profiles not me, not target profile (allow already-following to increase pool)
      const excludeIds = new Set<string>([meId, profile.id])
      const [popularRes, theirFollowingIdsRes, theirFollowersIdsRes, recentRes] = await Promise.all([
        supabaseAdmin
          .from('users_profiles')
          .select('id,full_name,username,avatar_url,followers_count,created_at')
          .order('followers_count', { ascending: false })
          .limit(200),
        supabaseAdmin
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', profile.id)
          .limit(200),
        supabaseAdmin
          .from('user_follows')
          .select('follower_id')
          .eq('following_id', profile.id)
          .limit(200),
        supabaseAdmin
          .from('users_profiles')
          .select('id,full_name,username,avatar_url,followers_count,created_at')
          .order('created_at', { ascending: false })
          .limit(100),
      ])
      type ProfileRow = { id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null; followers_count?: number }
      type FollowRow2 = { following_id: string }
      type FollowerRow = { follower_id: string }
      const popular = (popularRes.data || []) as ProfileRow[]
      const theirFollowingIds = new Set(((theirFollowingIdsRes.data || []) as FollowRow2[]).map(r => r.following_id))
      const theirFollowerIds = new Set(((theirFollowersIdsRes.data || []) as FollowerRow[]).map(r => r.follower_id))
      const recent = (recentRes.data || []) as ProfileRow[]
      const idToProfile = new Map<string, ProfileRow>()
      for (const p of popular.concat(recent)) idToProfile.set(p.id, p)
      const candidateIds: string[] = []
      for (const p of popular) if (!excludeIds.has(p.id)) candidateIds.push(p.id)
      for (const id of Array.from(theirFollowingIds)) if (!excludeIds.has(id)) candidateIds.push(id)
      for (const id of Array.from(theirFollowerIds)) if (!excludeIds.has(id)) candidateIds.push(id)
      // de-duplicate
      const uniqIds: string[] = []
      const seen = new Set<string>()
      for (const id of candidateIds) {
        if (!id || excludeIds.has(id)) continue
        if (!seen.has(id)) { seen.add(id); uniqIds.push(id) }
      }
      const candIds = uniqIds.slice(0, 120)
      const mutualMap: Record<string, number> = {}
      if (candIds.length && mySet.size) {
        // Count how many of my following also follow each candidate (mutual friends count)
        const { data: overlaps } = await supabaseAdmin
          .from('user_follows')
          .select('following_id')
          .in('follower_id', Array.from(mySet))
          .in('following_id', candIds)
        for (const row of (overlaps || []) as FollowRow2[]) {
          const k = row.following_id
          mutualMap[k] = (mutualMap[k] || 0) + 1
        }
      }
      const enriched = candIds
        .map(id => {
          const p = idToProfile.get(id) || { id }
          return { id, full_name: p.full_name, username: p.username, avatar_url: p.avatar_url, followers_count: p.followers_count || 0, mutual_count: mutualMap[id] || 0 }
        })
        .sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0) || (b.mutual_count || 0) - (a.mutual_count || 0))
      suggestions = enriched
    }
  } catch {}

  return (
    <div className="container mx-auto px-0 sm:px-4 py-0">
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4 sm:gap-6">
            { }
            <EnlargeableAvatar src={profile.avatar_url || undefined} alt="avatar" className="h-20 w-20 sm:h-24 sm:w-24" />
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-baseline gap-2 w-full min-w-0">
                <div className="text-gray-900 font-semibold text-base sm:text-lg truncate">{profile.full_name || profile.username || 'Kullanıcı'}</div>
                <div className="text-gray-500 text-xs sm:text-sm truncate">@{profile.username || profile.id.slice(0,6)}</div>
                {/* Hide follow button for own profile */}
                {!isSelf && <FollowButton profileId={profile.id} className="ml-auto" />}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center sm:text-left sm:flex sm:items-center sm:gap-6">
                <div className="text-xs sm:text-sm text-gray-600"><span className="text-gray-900 font-semibold text-sm sm:text-base">{stories.length}</span> Gönderi</div>
                <Link href={`/u/${profile.id}/followers`} className="text-xs sm:text-sm text-gray-600 hover:underline"><span className="text-gray-900 font-semibold text-sm sm:text-base">{followers}</span> Takipçi</Link>
                <Link href={`/u/${profile.id}/following`} className="text-xs sm:text-sm text-gray-600 hover:underline"><span className="text-gray-900 font-semibold text-sm sm:text-base">{following}</span> Takip</Link>
              </div>
              {profile.bio?.trim() ? (
                <div className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">
                  {profile.bio}
                </div>
              ) : null}
            </div>
          </div>
        </div>

      {/* Mutual connections */}
      {mutuals.length > 0 && (
        <div className="px-4 sm:px-6 py-3">
          <MutualConnections mutuals={mutuals} />
        </div>
      )}

      {/* Discover people */}
      {suggestions.length > 0 && (
        <div className="px-4 sm:px-6 py-3">
          <div className="text-sm font-medium text-gray-900 mb-2">Discover people</div>
          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar">
            {suggestions.slice(0, 12).map((p) => (
              <div key={p.id} className="shrink-0 w-[200px] sm:w-[220px] rounded-2xl border border-blue-100 bg-blue-50/30 p-4 text-center">
                { }
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.avatar_url || '/default-avatar.svg'} alt="avatar" className="mx-auto h-16 w-16 rounded-full object-cover" />
                <Link href={`/u/${p.id}`} className="block mt-3 text-sm font-semibold text-gray-900 hover:underline truncate">{p.full_name || p.username || 'Kullanıcı'}</Link>
                <div className="text-xs text-gray-600 mt-0.5">{p.mutual_count ? `${p.mutual_count} mutual friends` : 'Suggested for you'}</div>
                <div className="mt-3">
                  <FollowButton profileId={p.id} className="w-full bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions: Community, Search, and My Profile (same style as user profile icons) */}
      <div className="mb-3 flex items-center justify-center gap-3">
        <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
          <Link href="/community" aria-label="Topluluk">
            <Users className="h-6 w-6" />
          </Link>
        </Button>
        {/* Search popover (same behavior as own profile) */}
        <UserSearchPopover />
        <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
          <Link href="/profile" aria-label="Profilime dön">
            <UserIcon className="h-6 w-6" />
          </Link>
        </Button>
      </div>

        <div className="grid grid-cols-3 gap-[1px] sm:gap-[2px] bg-white mt-[1px]">
          {stories.map((s: any) => (
            <Link key={s.id} href={s.slug ? `/community/stories/${s.slug}` : '#'} className="block">
              <div className="relative aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image_url || '/next.svg'} alt={s.image_alt || s.title} className="h-full w-full object-cover" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}



