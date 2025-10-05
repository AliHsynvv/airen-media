'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ReviewsPanel({ items }: { items: any[] }) {
  const [list, setList] = useState(items)
  const [savingId, setSavingId] = useState<string | null>(null)

  const updateReview = async (id: string, changes: { status?: string; reply?: string }) => {
    setSavingId(id)
    try {
      const res = await fetch('/api/business/reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ review_id: id, status: changes.status, reply: changes.reply }) })
      if (!res.ok) throw new Error('Güncelleme hatası')
      setList(prev => prev.map(r => r.id === id ? { ...r, ...changes, owner_reply_at: changes.reply ? new Date().toISOString() : r.owner_reply_at } : r))
    } catch (e) {
      alert((e as any)?.message || 'Hata')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {list.map(r => (
        <div key={r.id} className="rounded-xl border border-gray-100 p-3">
          <div className="flex items-center gap-2 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {r.users?.avatar_url ? <img src={r.users.avatar_url} alt="" className="h-6 w-6 rounded-full" /> : <div className="h-6 w-6 rounded-full bg-gray-200" />}
            <div className="font-medium">{r.users?.full_name || r.users?.username || 'Kullanıcı'}</div>
            <div className="ml-auto text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</div>
          </div>
          <div className="mt-1 text-sm">{r.comment || '—'}</div>
          <div className="mt-1 text-xs text-gray-500">Puan: {r.rating}</div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-2 items-start">
            <select defaultValue={r.status} onChange={e => updateReview(r.id, { status: e.target.value })} className="h-9 rounded-md border border-gray-200 px-2 text-sm">
              <option value="approved">Onaylı</option>
              <option value="pending">Beklemede</option>
              <option value="rejected">Reddedildi</option>
            </select>
            <div className="sm:col-span-3 flex gap-2">
              <input defaultValue={r.owner_reply || ''} placeholder="Yanıt yazın..." className="flex-1 h-9 rounded-md border border-gray-200 px-3 text-sm" onBlur={e => e.target.value !== (r.owner_reply || '') && updateReview(r.id, { reply: e.target.value })} />
              <Button disabled={savingId === r.id} onClick={() => updateReview(r.id, { reply: (document.activeElement as HTMLInputElement)?.value })} className="h-9">Kaydet</Button>
            </div>
          </div>
        </div>
      ))}
      {list.length === 0 && <div className="text-sm text-gray-500">Henüz yorum yok.</div>}
    </div>
  )
}


