'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import BusinessLocationPicker from './BusinessLocationPicker'

type Props = {
  business: any
}

export default function BusinessProfileForm({ business }: Props) {
  const [form, setForm] = useState({
    name: business.name || '',
    category: business.category || '',
    description: business.description || '',
    website: business.website || '',
    email: business.email || '',
    phone: business.phone || '',
    location: business.location || '',
    latitude: business.latitude ?? '',
    longitude: business.longitude ?? '',
    social_instagram: business.social_instagram || '',
    social_tiktok: business.social_tiktok || '',
    social_facebook: business.social_facebook || '',
    social_youtube: business.social_youtube || '',
  })
  const [services, setServices] = useState<string[]>(business.services || [])
  const [serviceInput, setServiceInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const update = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const addService = () => {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      setServices([...services, serviceInput.trim()])
      setServiceInput('')
    }
  }

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const submit = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const payload = { ...form, id: business.id, services }
      if (payload.latitude === '') delete (payload as any).latitude
      if (payload.longitude === '') delete (payload as any).longitude
      const res = await fetch('/api/business/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Kaydetme hatası')
      }
      setMessage('Kaydedildi')
      // Refresh page to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (e) {
      setMessage((e as any)?.message || 'Kaydetme hatası')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 space-y-3">
      <h2 className="font-semibold">İşletme Bilgileri</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Ad</label>
          <input value={form.name} onChange={e => update('name', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Kategori</label>
          <input value={form.category} onChange={e => update('category', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-1">Açıklama</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={5} className="w-full rounded-md border border-gray-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Website</label>
          <input value={form.website} onChange={e => update('website', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">E-posta</label>
          <input value={form.email} onChange={e => update('email', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Telefon</label>
          <input value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Konum</label>
          <input value={form.location} onChange={e => update('location', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Enlem (lat)</label>
          <input value={form.latitude} onChange={e => update('latitude', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Boylam (lng)</label>
          <input value={form.longitude} onChange={e => update('longitude', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Harita</label>
        <BusinessLocationPicker
          latitude={form.latitude as any}
          longitude={form.longitude as any}
          onChange={(lat, lng) => setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Instagram</label>
          <input value={form.social_instagram} onChange={e => update('social_instagram', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">TikTok</label>
          <input value={form.social_tiktok} onChange={e => update('social_tiktok', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Facebook</label>
          <input value={form.social_facebook} onChange={e => update('social_facebook', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">YouTube</label>
          <input value={form.social_youtube} onChange={e => update('social_youtube', e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <label className="block text-sm text-gray-700 mb-2 font-medium">Hizmetler</label>
        <div className="flex gap-2 mb-3">
          <input 
            value={serviceInput} 
            onChange={e => setServiceInput(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addService())}
            placeholder="Hizmet ekle (ör: WiFi, Otopark, Restaurant)" 
            className="flex-1 h-10 rounded-md border border-gray-200 px-3" 
          />
          <button 
            type="button"
            onClick={addService} 
            className="h-10 px-4 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
          >
            Ekle
          </button>
        </div>
        {services.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {services.map((service, idx) => (
              <div 
                key={idx} 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-800 border border-gray-200"
              >
                <span>{service}</span>
                <button 
                  type="button"
                  onClick={() => removeService(idx)} 
                  className="text-gray-500 hover:text-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={saving || !form.name} className="rounded-full">{saving ? 'Kaydediliyor…' : 'Kaydet'}</Button>
        {message && <div className="text-sm text-gray-600">{message}</div>}
      </div>
    </div>
  )
}


