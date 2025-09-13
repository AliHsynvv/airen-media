'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Row {
  id: string
  name: string
  slug: string
  capital: string | null
  status: string
}

export default function AdminCountriesListPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('countries')
      .select('id,name,slug,capital,status')
      .order('name', { ascending: true })
      .limit(200)
    if (!error) setRows((data as any) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = async (id: string) => {
    setMessage(null)
    const res = await fetch(`/api/admin/countries/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok || !json.success) setMessage(json.error || 'Silinemedi')
    else { setMessage('Silindi'); load() }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Ülkeler</h1>
        <Button asChild className="h-10 px-4 rounded-md bg-black text-white hover:bg-black/90"><Link href="/admin/countries/create">Yeni Ülke</Link></Button>
      </div>
      <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-gray-800">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3 font-medium">Ad</th>
              <th className="text-left p-3 font-medium">Slug</th>
              <th className="text-left p-3 font-medium">Başkent</th>
              <th className="text-left p-3 font-medium">Durum</th>
              <th className="text-right p-3 font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-gray-500" colSpan={5}>Yükleniyor...</td></tr>
            ) : rows.length ? rows.map(r => (
              <tr key={r.id} className="border-t border-gray-200">
                <td className="p-3 font-medium text-gray-900">{r.name}</td>
                <td className="p-3 text-gray-600">{r.slug}</td>
                <td className="p-3 text-gray-700">{r.capital || '-'}</td>
                <td className="p-3"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${r.status==='active'?'bg-green-50 text-green-700 border-green-200':'bg-gray-100 text-gray-700 border-gray-200'}`}>{r.status}</span></td>
                <td className="p-3 text-right space-x-2">
                  <Button asChild size="sm" className="h-8 px-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"><Link href={`/countries/${r.slug}`}>Görüntüle</Link></Button>
                  <Button asChild size="sm" className="h-8 px-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"><Link href={`/admin/countries/${r.id}/edit`}>Düzenle</Link></Button>
                  <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => remove(r.id)}>Sil</Button>
                </td>
              </tr>
            )) : (
              <tr><td className="p-4 text-gray-500" colSpan={5}>Kayıt yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {message && <div className="text-sm text-gray-700 mt-3">{message}</div>}
    </div>
  )
}


