'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import slugify from 'slugify'

export default function StorySubmitPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('culture')
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)

  const upload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'stories')
    form.append('bucket', 'Stories')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed')
    return json.data.url as string
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) {
        window.location.href = '/auth/login'
        return
      }
      const baseSlug = slugify(title, { lower: true, strict: true })
      let slug = baseSlug
      let attempt = 0
      while (attempt < 2) {
        const { error } = await supabase.from('user_stories').insert({
          title,
          slug,
          content,
          image_url: imageUrl || null,
          category,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          user_id: user.id,
          location: location || null,
          status: 'pending',
        })
        if (!error) break
        // retry with random suffix on unique violation
        slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`
        attempt += 1
      }
      setMessage('Hikayen alındı! İnceleme sonrası yayınlanacaktır.')
      setTitle('')
      setContent('')
      setCategory('culture')
      setImageUrl('')
      setTags('')
      setLocation('')
    } catch (err: any) {
      setMessage(`Hata: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Hikayeni Paylaş</h1>
        <p className="text-gray-400 mt-1">Deneyimini toplulukla paylaş ve ilham ol.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Başlık</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn: Paris’te 48 saat" required />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Konum (opsiyonel)</label>
          <div className="flex items-center gap-2">
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Örn: İstanbul, Türkiye veya 41.0082,28.9784" className="flex-1" />
            <Button
              type="button"
              variant="secondary"
              className="border border-gray-200 bg-white text-black hover:bg-gray-50"
              onClick={async () => {
                if (!('geolocation' in navigator)) { setMessage('Konum desteklenmiyor'); return }
                setLocating(true); setMessage(null)
                try {
                  await new Promise<void>((resolve) => {
                    navigator.geolocation.getCurrentPosition(async (pos) => {
                      const { latitude, longitude } = pos.coords
                      try {
                        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
                        const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
                        if (res.ok) {
                          const j = await res.json()
                          const city = j?.address?.city || j?.address?.town || j?.address?.village || ''
                          const country = j?.address?.country || ''
                          const label = [city, country].filter(Boolean).join(', ')
                          setLocation(label || `${latitude.toFixed(6)},${longitude.toFixed(6)}`)
                        } else {
                          setLocation(`${latitude.toFixed(6)},${longitude.toFixed(6)}`)
                        }
                      } catch {
                        setLocation(`${latitude.toFixed(6)},${longitude.toFixed(6)}`)
                      }
                      resolve()
                    }, () => {
                      setMessage('Konum alınamadı: İzin verilmedi veya hata oluştu')
                      resolve()
                    }, { enableHighAccuracy: true, timeout: 10000 })
                  })
                } finally {
                  setLocating(false)
                }
              }}
              disabled={locating}
            >
              {locating ? 'Alınıyor…' : 'Konumumu kullan'}
            </Button>
          </div>
          <p className="mt-1 text-xs text-gray-400">Konum, hikayenle birlikte herkese açık görünebilir.</p>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Kategori</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-transparent border rounded-md px-3 py-2"
          >
            <option value="culture">Kültür</option>
            <option value="gastronomy">Gastronomi</option>
            <option value="adventure">Macera</option>
            <option value="budget">Bütçe</option>
            <option value="luxury">Lüks</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Hikaye</label>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={8}
            placeholder="Deneyimini detaylıca anlat..."
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Etiketler (virgülle)</label>
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="yemek, rota, ipucu" />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Kapak Görseli</label>
          <div className="flex items-center gap-3">
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://... (opsiyonel)" className="flex-1" />
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
                    setImageUrl(url)
                  } catch (err: any) {
                    setMessage(`Upload hatası: ${err.message}`)
                  } finally {
                    setLoading(false)
                  }
                }}
              />
            </label>
          </div>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="preview" className="mt-2 h-32 rounded-lg object-cover border border-white/10" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link href="/community" className="text-sm text-gray-300 hover:text-white">Geri dön</Link>
          <div className="text-sm text-gray-300 mr-3">{message}</div>
          <Button type="submit" variant="neon" disabled={loading}>{loading ? 'Gönderiliyor...' : 'Gönder'}</Button>
        </div>
      </form>
    </div>
  )
}


