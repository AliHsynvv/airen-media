'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface CategoryRow {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<CategoryRow>>({ name: '', slug: '', description: '', color: null, icon: null, sort_order: 0, is_active: true })
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const json = await res.json()
    if (json.success) setRows(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => { setForm({ name: '', slug: '', description: '', color: null, icon: null, sort_order: 0, is_active: true }); setEditingId(null) }

  const save = async () => {
    setMessage(null)
    if (!form.name || !form.slug) { setMessage('Name ve slug zorunlu'); return }
    const token = (await supabase.auth.getUser()).data.user ? (await supabase.auth.getSession()).data.session?.access_token : undefined
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` }
    const res = editingId
      ? await fetch(`/api/admin/categories/${editingId}`, { method: 'PUT', headers, body: JSON.stringify(form) })
      : await fetch('/api/admin/categories', { method: 'POST', headers, body: JSON.stringify(form) })
    const json = await res.json()
    if (!json.success) { setMessage(json.error || 'Hata'); return }
    resetForm(); load()
  }

  const edit = (r: CategoryRow) => {
    setEditingId(r.id)
    setForm({ ...r })
  }

  const remove = async (id: string) => {
    if (!confirm('Silinsin mi?')) return
    const token = (await supabase.auth.getUser()).data.user ? (await supabase.auth.getSession()).data.session?.access_token : undefined
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token || ''}` } })
    const json = await res.json()
    if (!json.success) setMessage(json.error || 'Hata')
    else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="h-9 rounded-md border border-gray-200 bg-white text-gray-900 px-3" placeholder="Name" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="h-9 rounded-md border border-gray-200 bg-white text-gray-900 px-3" placeholder="Slug" value={form.slug || ''} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          <input className="h-9 rounded-md border border-gray-200 bg-white text-gray-900 px-3" placeholder="Description" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <input className="h-9 rounded-md border border-gray-200 bg-white text-gray-900 px-3" placeholder="Color (optional)" value={form.color || ''} onChange={e => setForm(f => ({ ...f, color: e.target.value || null }))} />
          <input className="h-9 rounded-md border border-gray-200 bg-white text-gray-900 px-3" placeholder="Icon (optional)" value={form.icon || ''} onChange={e => setForm(f => ({ ...f, icon: e.target.value || null }))} />
          <input type="number" className="h-9 rounded-md border border-gray-200 bg-white text-gray-900 px-3" placeholder="Sort" value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          <label className="inline-flex items-center gap-2 text-gray-700"><input type="checkbox" checked={!!form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Aktif</label>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button variant="secondary" className="border border-gray-200 bg-white text-black hover:bg-gray-50" size="sm" onClick={save}>{editingId ? 'Güncelle' : 'Ekle'}</Button>
          <Button variant="secondary" className="border border-gray-200 bg-white text-black hover:bg-gray-50" size="sm" onClick={resetForm}>Temizle</Button>
          {message && <span className="text-sm text-gray-600">{message}</span>}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Ad</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Aktif</th>
              <th className="text-right p-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-gray-500" colSpan={4}>Yükleniyor...</td></tr>
            ) : rows.length ? rows.map(r => (
              <tr key={r.id} className="border-t border-gray-200">
                <td className="p-3 text-gray-900">{r.name}</td>
                <td className="p-3 text-gray-700">{r.slug}</td>
                <td className="p-3">{r.is_active ? 'Evet' : 'Hayır'}</td>
                <td className="p-3 text-right space-x-2">
                  <Button size="sm" variant="secondary" className="border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={() => edit(r)}>Düzenle</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>Sil</Button>
                </td>
              </tr>
            )) : (
              <tr><td className="p-4 text-gray-500" colSpan={4}>Kayıt yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


