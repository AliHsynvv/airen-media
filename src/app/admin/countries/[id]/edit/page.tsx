'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function AdminCountryEditPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [capital, setCapital] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [officialLanguage, setOfficialLanguage] = useState('')
  const [currency, setCurrency] = useState('')
  const [timezone, setTimezone] = useState('')
  const [cultureDescription, setCultureDescription] = useState('')
  const [visaInfo, setVisaInfo] = useState('')
  const [popularActivities, setPopularActivities] = useState('')
  const [airenAdvice, setAirenAdvice] = useState('')
  const [topPlaces, setTopPlaces] = useState('')

  const upload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'countries')
    form.append('bucket', 'Countries')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed')
    return json.data.url as string
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch(`/api/admin/countries/${id}`)
      const json = await res.json()
      if (res.ok && json.success) {
        const c = json.data
        setName(c.name || '')
        setSlug(c.slug || '')
        setCapital(c.capital || '')
        setFeaturedImage(c.featured_image || '')
        setStatus(c.status || 'active')
        setOfficialLanguage(c.official_language || '')
        setCurrency(c.currency || '')
        setTimezone(c.timezone || '')
        setCultureDescription(c.culture_description || '')
        setVisaInfo(c.visa_info || '')
        setPopularActivities(Array.isArray(c.popular_activities) ? c.popular_activities.join(', ') : '')
        setAirenAdvice(c.airen_advice || '')
        setTopPlaces(Array.isArray(c.top_places) ? c.top_places.map((p: any) => `${p.name || ''}|${p.description || ''}`).join('\n') : '')
      } else {
        setMessage(json.error || 'Yüklenemedi')
      }
      setLoading(false)
    }
    if (id) load()
  }, [id])

  const save = async () => {
    setMessage(null)
    const res = await fetch(`/api/admin/countries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug,
        capital,
        featured_image: featuredImage,
        status,
        official_language: officialLanguage || null,
        currency: currency || null,
        timezone: timezone || null,
        culture_description: cultureDescription || null,
        visa_info: visaInfo || null,
        popular_activities: popularActivities ? popularActivities.split(',').map(s => s.trim()).filter(Boolean) : [],
        airen_advice: airenAdvice || null,
        top_places: topPlaces
          ? topPlaces.split('\n').map(line => {
              const [name, description] = line.split('|')
              return { name: (name || '').trim(), description: (description || '').trim() }
            }).filter(p => p.name)
          : [],
      }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) setMessage(json.error || 'Kaydedilemedi')
    else setMessage('Kaydedildi')
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-white mb-4">Ülke Düzenle</h1>
      {loading ? (
        <div className="text-gray-300">Yükleniyor...</div>
      ) : (
        <div className="space-y-4 glass-card p-4 rounded-xl">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Ad</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Slug</label>
            <Input value={slug} onChange={e => setSlug(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Başkent</label>
            <Input value={capital} onChange={e => setCapital(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Kapak Görseli</label>
            <div className="flex items-center gap-3">
              <Input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} className="flex-1" />
              <label className="neon-button px-3 py-2 rounded-md cursor-pointer text-sm">
                Yükle
                <input type="file" accept="image/*" className="hidden"
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
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Durum</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-transparent border rounded-md px-3 py-2">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Resmi Dil</label>
              <Input value={officialLanguage} onChange={e => setOfficialLanguage(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Para Birimi</label>
              <Input value={currency} onChange={e => setCurrency(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Zaman Dilimi</label>
              <Input value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="GMT+3" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Genel Bilgiler</label>
            <Textarea value={cultureDescription} onChange={e => setCultureDescription(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Vize & Giriş</label>
            <Textarea value={visaInfo} onChange={e => setVisaInfo(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Popüler Aktiviteler (virgülle)</label>
            <Input value={popularActivities} onChange={e => setPopularActivities(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Airen Tavsiyesi</label>
            <Textarea value={airenAdvice} onChange={e => setAirenAdvice(e.target.value)} rows={2} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">En Çok Ziyaret Edilen Yerler (satır başına "Ad|Açıklama")</label>
            <Textarea value={topPlaces} onChange={e => setTopPlaces(e.target.value)} rows={3} />
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


