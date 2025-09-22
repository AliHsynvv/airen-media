import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/server'
import FollowButton from '@/components/profile/FollowButton'
import TravelersSortMenu from '@/components/travelers/TravelersSortMenu'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface TravelersPageProps {
  searchParams: Promise<{ sort?: string }>
}

export default async function TravelersPage(context: TravelersPageProps) {
  const { sort } = await context.searchParams
  const sortKey = (Array.isArray(sort) ? sort[0] : sort) || 'new'

  let query = supabaseAdmin
    .from('users_profiles')
    .select('id, full_name, username, avatar_url, bio, followers_count, following_count, created_at')
    .limit(200)

  if (sortKey === 'followers') {
    query = query.order('followers_count', { ascending: false })
  } else if (sortKey === 'following') {
    query = query.order('following_count', { ascending: false })
  } else if (sortKey === 'name') {
    query = query.order('full_name', { ascending: true }).order('username', { ascending: true })
  } else {
    // new (default)
    query = query.order('created_at', { ascending: false })
  }

  const { data: profiles } = await query
  const users = profiles || []

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Travelers</h1>
          <p className="text-sm text-gray-600 mt-1">Topluluğumuzdaki tüm gezginler</p>
        </div>
        <TravelersSortMenu currentSort={sortKey} />
      </div>

      {users.length ? (
        <ul className="space-y-3">
          {users.map((u: any) => (
            <li key={u.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="avatar" className="h-14 w-14 rounded-full object-cover ring-1 ring-gray-200" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gray-100 ring-1 ring-gray-200" />
                )}
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/u/${u.id}`} className="text-gray-900 font-semibold truncate hover:underline">
                      {u.full_name || u.username || 'Kullanıcı'}
                    </Link>
                    <div className="text-xs text-gray-600 truncate">@{u.username || String(u.id).slice(0,6)}</div>
                  </div>
                  {u.bio?.trim() ? (
                    <div className="text-sm text-gray-700 mt-1 line-clamp-2">{u.bio}</div>
                  ) : null}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                    <div><span className="text-gray-900 font-semibold">{u.followers_count ?? 0}</span> Followers</div>
                    <div><span className="text-gray-900 font-semibold">{u.following_count ?? 0}</span> Following</div>
                  </div>
                </div>
                {/* Follow */}
                <div className="shrink-0">
                  <FollowButton profileId={u.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-600">Henüz kullanıcı yok.</div>
      )}
    </div>
  )
}


