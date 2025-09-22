import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/server'
import FollowButton from '@/components/profile/FollowButton'
import { getServerSupabase } from '@/lib/supabase/server-ssr'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ id: string }>
}

export default async function PublicFollowingPage(context: Props) {
  const { id } = await context.params

  // If current user is the same, redirect to private following page
  try {
    const supabase = await getServerSupabase()
    const { data } = await supabase.auth.getSession()
    const meId = data.session?.user?.id || null
    if (meId && meId === id) redirect('/following')
  } catch {}

  const { data: user } = await supabaseAdmin
    .from('users_profiles')
    .select('id, full_name, username, avatar_url')
    .eq('id', id)
    .maybeSingle()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-gray-700">Kullanıcı bulunamadı.</div>
      </div>
    )
  }

  const { data: rows } = await supabaseAdmin
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', user.id)
    .limit(500)
  const followingIds = (rows || []).map((r: any) => r.following_id)

  let following: any[] = []
  if (followingIds.length) {
    const { data: profiles } = await supabaseAdmin
      .from('users_profiles')
      .select('id,full_name,username,avatar_url')
      .in('id', followingIds)
    following = (profiles || []) as any[]
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <Link href={`/u/${user.id}`} className="text-xl leading-none text-gray-900">×</Link>
        <div className="text-lg font-semibold text-gray-900">@{user.username || String(user.id).slice(0,6)} Following</div>
        <div className="w-5" />
      </div>

      {following.length ? (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {following.map(p => (
            <li key={p.id} className="px-3 sm:px-4 py-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">{(p.full_name || p.username || 'U')[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/u/${p.id}`} className="text-sm font-semibold text-gray-900 truncate hover:underline">{p.full_name || p.username || 'User'}</Link>
                  <div className="text-xs text-gray-600 truncate">@{p.username || String(p.id).slice(0,6)}</div>
                </div>
                <FollowButton profileId={p.id} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-600">Takip edilen yok.</div>
      )}
    </div>
  )
}


