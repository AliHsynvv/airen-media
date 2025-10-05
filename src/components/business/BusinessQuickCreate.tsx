'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function BusinessQuickCreate({ ownerId }: { ownerId: string }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    if (!name) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/business/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: ownerId, name, category: category || undefined })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Oluşturma hatası')
      }
      window.location.reload()
    } catch (e: any) {
      setError(e?.message || 'Oluşturma hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Hızlı İşletme Oluştur</h2>
        <p className="text-sm text-gray-600">Ad və opsiyonel kategori ilə dərhal başlayın.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">İşletme Adı</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Firma A.Ş." className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Kategori</label>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Cafe, Hotel, Tour..." className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div>
        <Button onClick={create} disabled={loading || !name} className="rounded-full bg-black text-white px-5">{loading ? 'Oluşturuluyor…' : 'Oluştur'}</Button>
      </div>
    </div>
  )
}
