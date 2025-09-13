import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseAdmin } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getServerSupabase } from '@/lib/supabase/server-ssr'

export default async function AdminDashboardPage() {
  // Simple dynamic KPIs (use `count` from Supabase response)
  const { count: totalArticles = 0 } = await supabaseAdmin
    .from('articles')
    .select('id', { count: 'exact', head: true })
  const { count: publishedArticles = 0 } = await supabaseAdmin
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
  const { count: pendingStoryCount = 0 } = await supabaseAdmin
    .from('user_stories')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
  const { count: totalUsers = 0 } = await supabaseAdmin
    .from('users_profiles')
    .select('id', { count: 'exact', head: true })

  // Fetch timestamps for charts (last 90 days window, limit for performance)
  const [articlesList, pvList, usersList] = await Promise.all([
    supabaseAdmin.from('articles').select('id,published_at,status').order('published_at', { ascending: false }).limit(2000),
    supabaseAdmin.from('page_views').select('id,created_at').order('created_at', { ascending: false }).limit(5000),
    supabaseAdmin.from('users_profiles').select('id,created_at').order('created_at', { ascending: false }).limit(2000),
  ])

  // Helpers to bucket daily counts for the last N days
  const days = 14
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - (days - 1))

  function makeBuckets() {
    const arr: { label: string; date: Date; value: number }[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      arr.push({ label: key, date: d, value: 0 })
    }
    return arr
  }

  function inc(bucket: { label: string; value: number }[], iso: string | null | undefined) {
    if (!iso) return
    const key = iso.slice(0, 10)
    const b = bucket.find(x => x.label === key)
    if (b) b.value += 1
  }

  const publishedArticlesArr = (articlesList.data || []).filter(a => (a as any).status === 'published')
  const articleBuckets = makeBuckets()
  publishedArticlesArr.forEach(a => inc(articleBuckets, (a as any).published_at))

  const pvBuckets = makeBuckets()
  ;(pvList.data || []).forEach(p => inc(pvBuckets, (p as any).created_at))

  const userBuckets = makeBuckets()
  ;(usersList.data || []).forEach(u => inc(userBuckets, (u as any).created_at))

  // Simple SVG line chart generator
  function LineChart({ data, color = '#0ea5e9' }: { data: { value: number }[]; color?: string }) {
    const w = 260, h = 80, pad = 8
    const max = Math.max(1, ...data.map(d => d.value))
    const step = (w - pad * 2) / (data.length - 1)
    const points = data.map((d, i) => {
      const x = pad + i * step
      const y = h - pad - (d.value / max) * (h - pad * 2)
      return `${x},${y}`
    }).join(' ')
    return (
      <svg width={w} height={h} className="block">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
        {data.map((d, i) => {
          const x = pad + i * step
          const y = h - pad - (d.value / max) * (h - pad * 2)
          return <circle key={i} cx={x} cy={y} r={2} fill={color} />
        })}
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Toplam İçerik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-gray-900">{totalArticles}</div>
            <div className="mt-3 text-xs text-gray-500">Son 14 gün yayınlanan</div>
            <LineChart data={articleBuckets} color="#111827" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Yayınlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-gray-900">{publishedArticles}</div>
            <div className="mt-3 text-xs text-gray-500">Günlük yayın</div>
            <LineChart data={articleBuckets} color="#2563eb" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Bekleyen Hikayeler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-gray-900">{pendingStoryCount}</div>
            <div className="mt-3 text-xs text-gray-500">Talepler</div>
            <LineChart data={userBuckets} color="#059669" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-gray-900">{totalUsers}</div>
            <div className="mt-3 text-xs text-gray-500">Son kayıtlar</div>
            <LineChart data={userBuckets} color="#7c3aed" />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Sayfa Görüntüleme (14g)</div>
              <LineChart data={pvBuckets} color="#f59e0b" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Yayınlanan İçerik (14g)</div>
              <LineChart data={articleBuckets} color="#2563eb" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Yeni Kullanıcılar (14g)</div>
              <LineChart data={userBuckets} color="#10b981" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


