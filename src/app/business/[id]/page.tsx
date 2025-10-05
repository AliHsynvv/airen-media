import { getServerSupabase } from '@/lib/supabase/server-ssr'
import BusinessLocationMap from '@/components/business/BusinessLocationMap'

export default async function PublicBusinessPage({ params }: { params: { id: string } }) {
  const supabase = await getServerSupabase()
  const id = params.id

  const [{ data: business }, { data: media }, { data: reviews }, { data: posts }] = await Promise.all([
    supabase.from('business_profiles').select('*').eq('id', id).maybeSingle(),
    supabase.from('business_media').select('*').eq('business_id', id).order('position', { ascending: true }).limit(12),
    supabase
      .from('business_reviews')
      .select('id,user_id,rating,comment,created_at,users:users_profiles!business_reviews_user_id_fkey(full_name,username,avatar_url)')
      .eq('business_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('business_posts')
      .select('id,title,content,published_at,status')
      .eq('business_id', id)
      .in('status', ['published'])
      .order('published_at', { ascending: false })
      .limit(10),
  ])

  if (!business) {
    return <div className="max-w-5xl mx-auto p-6">İşletme bulunamadı.</div>
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto">
        {/* Cover */}
        <div className="h-52 sm:h-64 md:h-72 w-full bg-gray-200 relative z-0 overflow-hidden rounded-b-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {business.cover_image_url && <img src={business.cover_image_url} alt="Cover" className="w-full h-full object-cover" />}
        </div>
        {/* Header */}
        <div className="px-4 sm:px-6 -mt-10 relative z-10">
          <div className="flex items-end gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {business.profile_image_url ? (
              <img src={business.profile_image_url} alt="Avatar" className="h-20 w-20 rounded-full border-4 border-white object-cover shadow relative z-10" />
            ) : (
              <div className="h-20 w-20 rounded-full border-4 border-white bg-gray-300 shadow relative z-10" />
            )}
          </div>
          <div className="pt-2 pl-1">
            <div className="text-xl font-semibold">{business.name}</div>
            <div className="text-sm text-gray-600">{business.category || ''}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 mt-6">
          <div className="flex gap-6 text-sm border-b border-gray-200">
            <a href="#about" className="py-3 px-1 -mb-px border-b-2 border-gray-900 text-gray-900">About</a>
            <a href="#reviews" className="py-3 px-1 -mb-px border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition">Reviews</a>
            <a href="#posts" className="py-3 px-1 -mb-px border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition">Posts</a>
          </div>
        </div>

        <div className="px-4 sm:px-6 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-6 mt-6">
          <main className="space-y-6">
            {/* About */}
            <section id="about" className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-2">About</h2>
              <p className="text-sm leading-6 text-gray-700 whitespace-pre-line">{business.description || '—'}</p>
              {!!media?.length && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {media!.map(m => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={m.id} src={m.url} alt={m.title || ''} className="rounded-2xl h-32 w-full object-cover ring-1 ring-gray-200 hover:ring-gray-300 transition-transform duration-150 hover:scale-[1.01]" />
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Reviews */}
            <section id="reviews" className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-2">Reviews</h2>
              <div className="space-y-3">
                {(reviews || []).map(r => (
                  <div key={r.id} className="rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition">
                    <div className="flex items-center gap-2 text-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {r.users?.avatar_url ? <img src={r.users.avatar_url} alt="" className="h-6 w-6 rounded-full" /> : <div className="h-6 w-6 rounded-full bg-gray-200" />}
                      <div className="font-medium">{(r.users as any)?.full_name || (r.users as any)?.username || 'User'}</div>
                      <div className="ml-auto text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-gray-700">{r.comment || '—'}</div>
                    <div className="mt-1 text-xs text-gray-500">Rating: {r.rating}</div>
                  </div>
                ))}
                {(!reviews || reviews.length === 0) && <div className="text-sm text-gray-500">No reviews yet.</div>}
              </div>
            </section>

            {/* Posts */}
            <section id="posts" className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-2">Posts</h2>
              <div className="space-y-3">
                {(posts || []).map(p => (
                  <div key={p.id} className="rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition">
                    <div className="text-sm font-medium text-gray-900">{p.title}</div>
                    {p.published_at && <div className="text-xs text-gray-500">{new Date(p.published_at).toLocaleDateString()}</div>}
                    <div className="text-sm mt-2 whitespace-pre-line leading-6 text-gray-700">{p.content || ''}</div>
                  </div>
                ))}
                {(!posts || posts.length === 0) && <div className="text-sm text-gray-500">No posts yet.</div>}
              </div>
            </section>
          </main>

          <aside className="space-y-4 md:sticky md:top-24 h-fit">
            <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Contact & Links</h3>
              <div className="text-sm text-gray-700 space-y-1">
                {business.email && <div><span className="text-gray-500">mail</span> — {business.email}</div>}
                {business.phone && <div><span className="text-gray-500">phone</span> — {business.phone}</div>}
                {business.location && <div><span className="text-gray-500">location</span> — {business.location}</div>}
              </div>
              {(business.latitude || business.longitude) && (
                <div className="mt-3">
                  <BusinessLocationMap latitude={business.latitude} longitude={business.longitude} />
                </div>
              )}
              {business.website && (
                <a href={business.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center justify-center w-full h-9 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition">Visit Website</a>
              )}
            </section>

            {(business.social_instagram || business.social_tiktok || business.social_facebook || business.social_youtube) && (
              <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Social Media</h3>
                <div className="flex flex-wrap gap-2">
                  {business.social_instagram && <a href={business.social_instagram} target="_blank" rel="noreferrer" className="px-3 h-8 inline-flex items-center rounded-full border bg-white hover:bg-gray-50">Instagram</a>}
                  {business.social_tiktok && <a href={business.social_tiktok} target="_blank" rel="noreferrer" className="px-3 h-8 inline-flex items-center rounded-full border bg-white hover:bg-gray-50">TikTok</a>}
                  {business.social_facebook && <a href={business.social_facebook} target="_blank" rel="noreferrer" className="px-3 h-8 inline-flex items-center rounded-full border bg-white hover:bg-gray-50">Facebook</a>}
                  {business.social_youtube && <a href={business.social_youtube} target="_blank" rel="noreferrer" className="px-3 h-8 inline-flex items-center rounded-full border bg-white hover:bg-gray-50">YouTube</a>}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}


