import ProfileClient from './ProfileClient'
import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabase/server-ssr'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface MyStoryRow {
  id: string
  title: string
  slug: string | null
  status: 'pending' | 'approved' | 'rejected' | 'featured'
  created_at: string
  image_url?: string | null
}

export default async function ProfilePage() {
  const t = await getTranslations('profile.private')
  const supabase = await getServerSupabase()
  const { data: userRes } = await supabase.auth.getUser()
  const u = userRes.user

  if (!u) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-6 text-center mt-8">
          <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center" />
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">{t('sessionMissingTitle')}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('sessionMissingDesc')}</p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="/auth/login" className="h-10 rounded-full bg-black text-white hover:bg-black/90 flex items-center justify-center">{t('login')}</a>
            <a href="/auth/register" className="h-10 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50 flex items-center justify-center">{t('register')}</a>
          </div>
        </div>
      </div>
    )
  }

  // If user owns a business profile, redirect to business dashboard
  try {
    const { data: biz } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('owner_id', u.id)
      .limit(1)
      .maybeSingle()
    if (biz?.id) {
      redirect('/business')
    }
  } catch {}

  let initialFullName: string | null = null
  let initialUsername: string | null = null
  let initialBio: string = ''
  let initialAvatarUrl: string | null = null
  let initialStories: MyStoryRow[] = []
  let initialFollowersCount = 0
  let initialFollowingCount = 0

  try {
    const { data: rp } = await supabase.rpc('get_profile_payload', { p_user: u.id })
    if (rp) {
      const profile = (rp as any).profile || {}
      const stories = ((rp as any).stories || []) as any[]
      initialFullName = profile.full_name ?? null
      initialUsername = profile.username ?? null
      initialAvatarUrl = profile.avatar_url ?? null
      initialBio = profile.bio || ''
      initialStories = stories.map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug || null,
        status: s.status,
        created_at: s.created_at,
        image_url: s.image_url || null,
      }))
      initialFollowersCount = (rp as any).followers || 0
      initialFollowingCount = (rp as any).following || 0
    }
  } catch {}

  if (!initialUsername) {
    const [{ data: p }, { data: storiesRes }, followersCountQuery, followingCountQuery] = await Promise.all([
      supabase.from('users_profiles').select('full_name,username,bio,avatar_url').eq('id', u.id).single(),
      supabase.from('user_stories').select('id,title,slug,status,created_at,image_url').eq('user_id', u.id).order('created_at', { ascending: false }).limit(100),
      supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', u.id),
      supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', u.id),
    ])
    initialFullName = initialFullName ?? (p?.full_name ?? null)
    initialUsername = initialUsername ?? (p?.username ?? null)
    initialAvatarUrl = initialAvatarUrl ?? (p?.avatar_url ?? null)
    initialBio = initialBio || (p?.bio || '')
    initialStories = initialStories.length ? initialStories : ((storiesRes as any[]) || []) as MyStoryRow[]
    initialFollowersCount = initialFollowersCount || (followersCountQuery?.count || 0)
    initialFollowingCount = initialFollowingCount || (followingCountQuery?.count || 0)
  }

  return (
    <ProfileClient
      initialUserId={u.id}
      initialEmail={u.email || ''}
      initialFullName={initialFullName}
      initialUsername={initialUsername}
      initialBio={initialBio}
      initialAvatarUrl={initialAvatarUrl}
      initialStories={initialStories}
      initialFollowersCount={initialFollowersCount}
      initialFollowingCount={initialFollowingCount}
    />
  )
}


