import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/server'
import StoryCard from '@/components/community/StoryCard'
import FollowButton from '@/components/profile/FollowButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PublicUserProfilePage(context: Props) {
  const { id } = await context.params
  const { data: profile } = await supabaseAdmin
    .from('users_profiles')
    .select('id,full_name,username,avatar_url,created_at')
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
        <div className="rounded-none sm:rounded-xl border border-gray-200 bg-white p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200" />
          )}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 w-full">
              <div className="min-w-0">
                <div className="text-black font-semibold text-base sm:text-lg truncate">{profile.full_name || profile.username || 'Kullanıcı'}</div>
                <div className="text-gray-600 text-xs sm:text-sm truncate">@{profile.username || profile.id.slice(0,6)}</div>
              </div>
              <FollowButton profileId={profile.id} className="ml-auto" />
            </div>
            <div className="mt-3 flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <div><span className="font-semibold">{stories.length}</span> Gönderi</div>
              <div><span className="font-semibold">{followers}</span> Takipçi</div>
              <div><span className="font-semibold">{following}</span> Takip</div>
            </div>
          </div>
          <Link href="/community" className="hidden sm:inline text-sm text-gray-700 hover:underline">Topluluğa Dön</Link>
        </div>

        <div className="mt-1 sm:mt-2 grid grid-cols-3 gap-[2px] sm:gap-1">
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



