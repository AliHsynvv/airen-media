'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function AdminArticleCreatePage() {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [message, setMessage] = useState<string | null>(null)

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
          type: 'news',
          status: 'published',
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Hata')
      setMessage('Haber yayınlandı!')
      setTitle('')
      setContent('')
      setExcerpt('')
      setFeaturedImage('')
    } catch (e: any) {
      setMessage(`Hata: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-white mb-4">Haber Ekle</h1>
      <div className="space-y-4 glass-card p-4 rounded-xl">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Başlık</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Haber başlığı" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Özet</label>
          <Input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Kısa özet (opsiyonel)" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">İçerik</label>
          <Textarea value={content} onChange={e => setContent(e.target.value)} rows={10} placeholder="Haber içeriği" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Kapak Görseli URL</label>
          <Input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://..." />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">{message}</div>
          <Button onClick={submit} variant="neon" disabled={loading || !title || !content}>
            {loading ? 'Yükleniyor...' : 'Yayınla'}
          </Button>
        </div>
      </div>
    </div>
  )
}


