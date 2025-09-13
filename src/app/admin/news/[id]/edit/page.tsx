'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function AdminNewsEditPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [tags, setTags] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch(`/api/admin/news/${id}`)
      const json = await res.json()
      if (res.ok && json.success) {
        const a = json.data
        setTitle(a.title || '')
        setContent(a.content || '')
        setExcerpt(a.excerpt || '')
        setFeaturedImage(a.featured_image || '')
        // Optional: load tags via separate join API in future
      } else {
        setMessage(json.error || 'Yüklenemedi')
      }
      setLoading(false)
    }
    if (id) load()
  }, [id])

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

  const save = async () => {
    setMessage(null)
    const res = await fetch(`/api/admin/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, excerpt, featured_image: featuredImage, tag_names: tags.split(',').map(t => t.trim()).filter(Boolean) }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) setMessage(json.error || 'Kaydedilemedi')
    else setMessage('Kaydedildi')
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-white mb-4">Haber Düzenle</h1>
      {loading ? (
        <div className="text-gray-300">Yükleniyor...</div>
      ) : (
        <div className="space-y-4 glass-card p-4 rounded-xl">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Başlık</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Özet</label>
            <Input value={excerpt} onChange={e => setExcerpt(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">İçerik</label>
            <Textarea value={content} onChange={e => setContent(e.target.value)} rows={10} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Kapak Görseli</label>
            <div className="flex items-center gap-3">
              <Input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} className="flex-1" />
              <label className="neon-button px-3 py-2 rounded-md cursor-pointer text-sm">
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
              <img src={featuredImage} alt="preview" className="mt-2 h-32 rounded-lg object-cover border border-white/10" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">{message}</div>
            <Button onClick={save} variant="neon">Kaydet</Button>
          </div>
        </div>
      )}
    </div>
  )
}


