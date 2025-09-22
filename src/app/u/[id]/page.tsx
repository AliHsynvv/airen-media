import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/server'
import StoryCard from '@/components/community/StoryCard'
import FollowButton from '@/components/profile/FollowButton'
import { Button } from '@/components/ui/button'
import { Users, User as UserIcon, Search } from 'lucide-react'
import UserSearchPopover from '@/components/profile/UserSearchPopover'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

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

  return (
    <div className="container mx-auto px-0 sm:px-4 py-0">
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover" />
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200" />
            )}
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



