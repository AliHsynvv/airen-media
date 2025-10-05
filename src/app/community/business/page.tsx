import { getServerSupabase } from '@/lib/supabase/server-ssr'
import Link from 'next/link'

export default async function CommunityBusinessMediaPage() {
  const supabase = await getServerSupabase()

  const [mediaRes, postsRes] = await Promise.all([
    supabase
      .from('business_media')
      .select(`
        id, url, media_type, created_at, business_id,
        business:business_profiles!business_media_business_id_fkey(id, name, profile_image_url)
      `)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('business_posts')
      .select(`
        id, title, status, published_at, created_at, business_id,
        business:business_profiles!business_posts_business_id_fkey(id, name, profile_image_url)
      `)
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  if (mediaRes.error || postsRes.error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">Business</h1>
        <div className="text-sm text-red-600">{mediaRes.error?.message || postsRes.error?.message}</div>
      </div>
    )
  }

  const media = (mediaRes.data || []) as any[]
  const posts = (postsRes.data || []) as any[]

  const groups = new Map<string, { business: any, media: any[], posts: any[] }>()
  for (const m of media) {
    const bid = m.business?.id || m.business_id
    if (!bid) continue
    if (!groups.has(bid)) groups.set(bid, { business: m.business, media: [], posts: [] })
    groups.get(bid)!.media.push(m)
  }
  for (const p of posts) {
    const bid = p.business?.id || p.business_id
    if (!bid) continue
    if (!groups.has(bid)) groups.set(bid, { business: p.business, media: [], posts: [] })
    groups.get(bid)!.posts.push(p)
  }

  const sections = Array.from(groups.values())

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Business</h1>
            <p className="text-sm text-gray-600">Topluluktan işletme paylaşımları</p>
          </div>
          <Link href="/business" className="text-sm underline">İşletme Paneli</Link>
        </div>

        {sections.map((sec, idx) => (
          <section key={idx} className="space-y-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {sec.business?.profile_image_url ? (
                <img src={sec.business.profile_image_url} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200" />
              )}
              <Link href={`/business/${sec.business?.id || ''}`} className="font-medium hover:underline">{sec.business?.name || 'Business'}</Link>
            </div>

            {sec.media.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sec.media.slice(0,4).map(m => (
                  <Link key={m.id} href={`/business/${sec.business?.id || ''}`} className="group relative block overflow-hidden rounded-2xl bg-gray-100">
                    {m.media_type === 'video' ? (
                      <video src={m.url} className="w-full h-40 object-cover" muted playsInline controls={false} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" className="w-full h-40 object-cover" />
                    )}
                  </Link>
                ))}
              </div>
            )}

            {sec.posts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sec.posts.slice(0,4).map(p => (
                  <Link key={p.id} href={`/business/${sec.business?.id || ''}`} className="rounded-2xl border border-gray-100 bg-white p-3 hover:shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {sec.business?.profile_image_url ? <img src={sec.business.profile_image_url} alt="" className="h-5 w-5 rounded-full" /> : <div className="h-5 w-5 rounded-full bg-gray-200" />}
                      <span className="font-medium text-gray-700">{sec.business?.name || 'Business'}</span>
                      <span className="ml-auto">{(p.published_at || p.created_at) ? new Date(p.published_at || p.created_at).toLocaleDateString() : ''}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{p.title || '—'}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}


