'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Row {
  id: string
  title: string
  category: string | null
  status: 'pending' | 'approved' | 'rejected' | 'featured'
  created_at: string
}

export default function AdminStoriesPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stories')
      const json = await res.json()
      if (res.ok && json.success) {
        setRows(json.data || [])
      } else {
        setRows([])
        setMessage(json.error || 'Yüklenemedi')
      }
    } catch (e: any) {
      setRows([])
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const setStatus = async (id: string, status: Row['status']) => {
    setMessage(null)
    const res = await fetch(`/api/admin/stories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) setMessage(json.error || 'Güncellenemedi')
    else { setMessage('Güncellendi'); load() }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Hikayeler</h1>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Başlık</th>
              <th className="text-left p-3">Kategori</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-right p-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-gray-500" colSpan={4}>Yükleniyor...</td></tr>
            ) : rows.length ? rows.map(r => (
              <tr key={r.id} className="border-t border-gray-200">
                <td className="p-3 text-gray-900">{r.title}</td>
                <td className="p-3 text-gray-700">{r.category || '-'}</td>
                <td className="p-3 text-gray-700">{r.status}</td>
                <td className="p-3 text-right space-x-2">
                  <Button size="sm" variant="secondary" className="border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={() => setStatus(r.id, 'approved')}>Onayla</Button>
                  <Button size="sm" variant="secondary" className="border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={() => setStatus(r.id, 'rejected')}>Reddet</Button>
                  <Button size="sm" variant="secondary" className="border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={() => setStatus(r.id, 'featured')}>Öne Çıkar</Button>
                </td>
              </tr>
            )) : (
              <tr><td className="p-4 text-gray-500" colSpan={4}>Kayıt yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {message && <div className="text-sm text-gray-600 mt-3">{message}</div>}
    </div>
  )}



