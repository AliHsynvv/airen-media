'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function AdminNewsCreatePage() {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [tags, setTags] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [categoryId, setCategoryId] = useState<string | ''>('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/categories')
        const json = await res.json()
        if (json.success) {
          const list = (json.data as any[]).filter(c => c.is_active).map(c => ({ id: c.id, name: c.name }))
          setCategories(list)
        }
      } catch {}
    }
    load()
  }, [])

  const upload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'news')
    form.append('bucket', 'Articles')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed')
    return json.data.url as string
  }

  const submit = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          featured_image: featuredImage || undefined,
          category_id: categoryId || undefined,
          type: 'news',
          status: 'published',
          tag_names: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Hata')
      setMessage('Haber yayınlandı!')
      setTitle('')
      setContent('')
      setExcerpt('')
      setFeaturedImage('')
      setTags('')
    } catch (e: any) {
      setMessage(`Hata: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Haber Ekle</h1>
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Başlık</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Haber başlığı" className="border border-gray-200 bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Kategori</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="h-9 rounded-md border border-gray-200 bg-white text-gray-900 px-3 w-full">
            <option value="">Seçiniz</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Özet</label>
          <Input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Kısa özet (opsiyonel)" className="border border-gray-200 bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">İçerik</label>
          <Textarea value={content} onChange={e => setContent(e.target.value)} rows={10} placeholder="Haber içeriği" className="border border-gray-200 bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Etiketler (virgülle ayırın)</label>
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="vize, turizm, istatistik" className="border border-gray-200 bg-white text-gray-900" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Kapak Görseli</label>
          <div className="flex items-center gap-3">
            <Input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://..." className="flex-1 border border-gray-200 bg-white text-gray-900" />
            <label className="px-3 py-2 rounded-md cursor-pointer text-sm border border-gray-200 bg-white text-black hover:bg-gray-50">
              Yükle
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setLoading(true)
                  try {
                    const url = await upload(f)
                    setFeaturedImage(url)
                  } catch (err: any) {
                    setMessage(`Upload hatası: ${err.message}`)
                  } finally {
                    setLoading(false)
                  }
                }}
              />
            </label>
          </div>
          {featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={featuredImage} alt="preview" className="mt-2 h-32 rounded-lg object-cover border border-gray-200" />
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">{message}</div>
          <Button onClick={submit} variant="secondary" className="border border-gray-200 bg-white text-black hover:bg-gray-50" disabled={loading || !title || !content}>
            {loading ? 'Yükleniyor...' : 'Yayınla'}
          </Button>
        </div>
      </div>
    </div>
  )
}



