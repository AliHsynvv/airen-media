import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function makeBuckets(days: number) {
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - (days - 1))
  const arr: { label: string; date: Date; value: number }[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    arr.push({ label: key, date: d, value: 0 })
  }
  return arr
}

function inc(bucket: { label: string; value: number }[], iso?: string | null) {
  if (!iso) return
  const key = iso.slice(0, 10)
  const b = bucket.find(x => x.label === key)
  if (b) b.value += 1
}

function LineChart({ data, color = '#111827' }: { data: { value: number }[]; color?: string }) {
  const w = 320, h = 90, pad = 8
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

export default async function AdminUsersPage() {
  const { count: totalUsersRaw } = await supabaseAdmin
    .from('users_profiles')
    .select('id', { count: 'exact', head: true })
  const totalUsers = totalUsersRaw ?? 0

  const { count: adminCountRaw } = await supabaseAdmin
    .from('users_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
  const adminCount = adminCountRaw ?? 0

  const { count: activeCountRaw } = await supabaseAdmin
    .from('users_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
  const activeCount = activeCountRaw ?? 0

  const { data: recentUsers } = await supabaseAdmin
    .from('users_profiles')
    .select('id,username,full_name,role,status,created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const days = 14
  const userBuckets = makeBuckets(days)
  ;(recentUsers || []).forEach(u => inc(userBuckets, (u as any).created_at))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Kullanıcılar</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-xl border border-gray-200 bg-white">
          <CardHeader><CardTitle className="text-gray-900">Toplam Kullanıcı</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl text-gray-900">{totalUsers}</div>
            <div className="mt-3 text-xs text-gray-500">Son 14 gün</div>
            <LineChart data={userBuckets} color="#0ea5e9" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white">
          <CardHeader><CardTitle className="text-gray-900">Aktif</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl text-gray-900">{activeCount}</div>
            <div className="mt-3 text-xs text-gray-500">Kayıt akışı</div>
            <LineChart data={userBuckets} color="#10b981" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 bg-white">
          <CardHeader><CardTitle className="text-gray-900">Admin</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl text-gray-900">{adminCount}</div>
            <div className="mt-3 text-xs text-gray-500">Oran: {totalUsers ? Math.round((adminCount/totalUsers)*100) : 0}%</div>
            <LineChart data={userBuckets} color="#7c3aed" />
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <CardHeader><CardTitle className="text-gray-900">Son 100 Kullanıcı</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-2">Kullanıcı Adı</th>
                  <th className="text-left p-2">Ad Soyad</th>
                  <th className="text-left p-2">Rol</th>
                  <th className="text-left p-2">Durum</th>
                  <th className="text-left p-2">Kayıt</th>
                </tr>
              </thead>
              <tbody>
                {(recentUsers || []).map(u => (
                  <tr key={(u as any).id} className="border-t border-gray-200">
                    <td className="p-2 text-gray-900">{(u as any).username || '—'}</td>
                    <td className="p-2 text-gray-700">{(u as any).full_name || '—'}</td>
                    <td className="p-2 text-gray-700">{(u as any).role}</td>
                    <td className="p-2 text-gray-700">{(u as any).status}</td>
                    <td className="p-2 text-gray-700">{new Date((u as any).created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


