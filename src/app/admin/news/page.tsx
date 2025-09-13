'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'

interface Row {
  id: string
  title: string
  slug: string
  status: string
  published_at: string | null
}

export default function AdminNewsListPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [q, setQ] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select('id,title,slug,status,published_at,type')
      .eq('type', 'news')
      .order('published_at', { ascending: false })
      .limit(100)
    if (!error) setRows((data as any) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const query = q.toLowerCase()
    if (!query) return rows
    return rows.filter(r => r.title.toLowerCase().includes(query) || r.slug.toLowerCase().includes(query))
  }, [rows, q])

  const remove = async (id: string) => {
    setMessage(null)
    const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok || !json.success) {
      setMessage(json.error || 'Silme başarısız')
    } else {
      setMessage('Silindi')
      load()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Haberler</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Ara..." value={q} onChange={e => setQ(e.target.value)} className="h-9 w-48 border border-gray-200 bg-white text-gray-900" />
          <Button asChild variant="secondary" className="border border-gray-200 bg-white text-black hover:bg-gray-50"><Link href="/admin/news/create">Yeni Haber</Link></Button>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Başlık</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-left p-3">Yayın</th>
              <th className="text-right p-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-gray-500" colSpan={5}>Yükleniyor...</td></tr>
            ) : filtered.length ? filtered.map(r => (
              <tr key={r.id} className="border-t border-gray-200">
                <td className="p-3 text-gray-900">{r.title}</td>
                <td className="p-3 text-gray-700">{r.slug}</td>
                <td className="p-3 text-gray-700">{r.status}</td>
                <td className="p-3 text-gray-700">{r.published_at || '-'}</td>
                <td className="p-3 text-right space-x-2">
                  <Button asChild size="sm" variant="secondary" className="border border-gray-200 bg-white text-black hover:bg-gray-50"><Link href={`/articles/${r.slug}`}>Görüntüle</Link></Button>
                  <Button asChild size="sm" variant="secondary" className="border border-gray-200 bg-white text-black hover:bg-gray-50"><Link href={`/admin/news/${r.id}/edit`}>Düzenle</Link></Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>Sil</Button>
                </td>
              </tr>
            )) : (
              <tr><td className="p-4 text-gray-500" colSpan={5}>Kayıt yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {message && <div className="text-sm text-gray-600 mt-3">{message}</div>}
    </div>
  )
}


