'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, MapPin, Type, Tag, Hash, RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null)
  const [userInitial, setUserInitial] = useState<string>('U')
  // editor state
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorSrc, setEditorSrc] = useState<string | null>(null)
  const [imgW, setImgW] = useState<number>(0)
  const [imgH, setImgH] = useState<number>(0)
  const [zoom, setZoom] = useState<number>(1)
  const [angle, setAngle] = useState<number>(0) // degrees
  const [flipH, setFlipH] = useState<boolean>(false)
  const [flipV, setFlipV] = useState<boolean>(false)
  const [offsetX, setOffsetX] = useState<number>(0) // -1..1 relative
  const [offsetY, setOffsetY] = useState<number>(0) // -1..1 relative
  const [outSize, setOutSize] = useState<'1080' | '864' | '600'>('1080')
  // color & light
  const [brightness, setBrightness] = useState<number>(100) // %
  const [contrast, setContrast] = useState<number>(100)
  const [saturation, setSaturation] = useState<number>(100)
  const [vibrance, setVibrance] = useState<number>(0) // % extra
  const [hue, setHue] = useState<number>(0) // deg
  const [exposure, setExposure] = useState<number>(0) // stops -2..2
  const [temperature, setTemperature] = useState<number>(0) // -100..100
  const [shadowsCtl, setShadowsCtl] = useState<number>(0) // -100..100
  const [highlightsCtl, setHighlightsCtl] = useState<number>(0)
  const resetEditor = () => {
    setZoom(1)
    setAngle(0)
    setFlipH(false)
    setFlipV(false)
    setOffsetX(0)
    setOffsetY(0)
    setOutSize('1080')
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setVibrance(0)
    setHue(0)
    setExposure(0)
    setTemperature(0)
    setShadowsCtl(0)
    setHighlightsCtl(0)
  }

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

  // Render the editor image with transforms into 4:5 canvas
  const renderEditedToFourFive = async (file: File): Promise<File> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    const img = document.createElement('img')
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = dataUrl
    })
    const targetW = outSize === '1080' ? 1080 : outSize === '864' ? 864 : 600
    const targetH = Math.round(targetW * 5 / 4)
    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')!
    // background transparent
    ctx.save()
    // Move to center
    ctx.translate(targetW / 2, targetH / 2)
    // Apply rotation and flipping
    const rad = angle * Math.PI / 180
    ctx.rotate(rad)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    // Determine base scale to cover canvas maintaining 4:5 crop, then apply zoom
    const srcRatio = img.width / img.height
    const targetRatio = targetW / targetH
    let drawW: number, drawH: number
    if (srcRatio > targetRatio) {
      // image wider -> match height
      drawH = targetH * (1 + Math.abs(offsetY) * 0.0) // keep
      drawW = drawH * srcRatio
    } else {
      // image taller -> match width
      drawW = targetW * (1 + Math.abs(offsetX) * 0.0)
      drawH = drawW / srcRatio
    }
    // Apply zoom
    drawW *= zoom
    drawH *= zoom
    // Offsets in pixels
    const dx = offsetX * targetW * 0.5
    const dy = offsetY * targetH * 0.5
    // Filters for brightness/contrast/saturation/hue + exposure
    const bFactor = (brightness / 100) * Math.pow(2, exposure)
    const cFactor = (contrast / 100)
    const sFactor = (saturation / 100) * (1 + vibrance / 100)
    ctx.filter = `brightness(${bFactor}) contrast(${cFactor}) saturate(${sFactor}) hue-rotate(${hue}deg)`
    // Draw image centered with offsets
    ctx.drawImage(img, -drawW / 2 + dx, -drawH / 2 + dy, drawW, drawH)
    ctx.restore()

    // Pixel-level adjustments: temperature, shadows, highlights
    if (temperature !== 0 || shadowsCtl !== 0 || highlightsCtl !== 0) {
      const id = ctx.getImageData(0, 0, targetW, targetH)
      const d = id.data
      const temp = temperature / 100 // -1..1
      const sh = shadowsCtl / 100
      const hi = highlightsCtl / 100
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2]
        // temperature: shift R/B
        if (temp !== 0) {
          r = Math.min(255, Math.max(0, r + 40 * temp))
          b = Math.min(255, Math.max(0, b - 40 * temp))
        }
        // luminance
        const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
        // shadows
        if (sh !== 0 && y < 128) {
          const f = sh > 0 ? sh : sh // symmetric
          const t = sh > 0 ? 255 : 0
          const mix = Math.abs(f) * (1 - y / 128)
          r = r + (t - r) * mix
          g = g + (t - g) * mix
          b = b + (t - b) * mix
        }
        // highlights
        if (hi !== 0 && y >= 128) {
          const f = hi > 0 ? hi : hi
          const t = hi > 0 ? 255 : 128
          const mix = Math.abs(f) * ((y - 128) / 127)
          r = r + (t - r) * mix
          g = g + (t - g) * mix
          b = b + (t - b) * mix
        }
        d[i] = r
        d[i + 1] = g
        d[i + 2] = b
      }
      ctx.putImageData(id, 0, 0)
    }
    const blob: Blob = await new Promise((resolve) => canvas.toBlob(b => resolve(b as Blob), 'image/jpeg', 0.9)!)
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '-4x5.jpg', { type: 'image/jpeg' })
  }

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      if (!u) return
      try {
        const res = await fetch('/api/auth/profile-by-id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: u.id }) })
        const json = await res.json()
        const avatar = json?.data?.avatar_url || null
        const name = json?.data?.full_name || u.email || 'U'
        setUserAvatarUrl(avatar)
        const initial = (name || 'U').trim()[0]
        if (initial) setUserInitial(initial)
      } catch {
        // fallback to client query
        const { data: p } = await supabase.from('users_profiles').select('full_name,avatar_url').eq('id', u.id).single()
        setUserAvatarUrl(p?.avatar_url || null)
        const initial = (p?.full_name || u.email || 'U').trim()[0]
        if (initial) setUserInitial(initial)
      }
    }
    load()
  }, [])

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
      let created = false
      let lastError: any = null
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
          status: 'approved',
        })
        if (!error) { created = true; break }
        // retry with random suffix on unique violation
        lastError = error
        slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`
        attempt += 1
      }
      if (!created) throw lastError || new Error('Gönderim başarısız oldu')
      // Success → redirect to profile
      window.location.href = '/profile'
      return
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
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <Link href="/community" className="text-gray-900 text-xl leading-none">×</Link>
          <div className="text-base font-semibold text-gray-900">New Post</div>
          <button className="text-sm font-medium text-blue-600 disabled:text-gray-400" onClick={handleSubmit as any} disabled={loading}>Share</button>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3">
          {/* Caption */}
          <div className="flex items-start gap-3">
            {userAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatarUrl} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-sm">{userInitial}</div>
            )}
            <Textarea value={content} onChange={e => setContent(e.target.value)} rows={3} placeholder="Write a caption..." className="flex-1" />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">
            <Type className="h-5 w-5 text-gray-600" />
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Add a header" className="bg-transparent border-0 focus-visible:ring-0" />
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">
            <MapPin className="h-5 w-5 text-gray-600" />
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Add location" className="bg-transparent border-0 focus-visible:ring-0" />
            <Button
              type="button"
              variant="secondary"
              className="ml-auto h-8 px-3 border border-gray-200 bg-white text-black hover:bg-gray-50"
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
              {locating ? 'Use GPS…' : 'Use GPS'}
            </Button>
          </div>
        </form>

        {/* Category */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 mt-3">
          <Tag className="h-5 w-5 text-gray-600" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="flex-1 bg-transparent border-0 outline-none">
            <option value="culture">Culture</option>
            <option value="gastronomy">Gastronomy</option>
            <option value="adventure">Adventure</option>
            <option value="budget">Budget</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        {/* Hashtags */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 mt-3">
          <Hash className="h-5 w-5 text-gray-600" />
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Add hashtags (e.g., #design #tech)" className="bg-transparent border-0 focus-visible:ring-0" />
        </div>

        {/* Upload Photo */}
        <div className="mt-3 rounded-xl bg-gray-50 px-3 py-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600">Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setLoading(true)
                try {
                  const form = new FormData()
                  form.append('file', f)
                  form.append('folder', 'stories')
                  form.append('bucket', 'Stories')
                  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
                  const json = await res.json()
                  if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed')
                  setImageUrl(json.data.url as string)
                } catch (err: any) {
                  setMessage(`Upload error: ${err.message}`)
                } finally {
                  setLoading(false)
                }
              }}
            />
          </label>
          {imageUrl && (
            <div className="mt-2 w-full rounded-lg overflow-hidden border border-gray-200">
              <div className="aspect-[4/5] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
              </div>
            </div>
          )}
        </div>

        {message && <div className="mt-3 text-sm text-gray-600">{message}</div>}
      </div>
      {/* Editing removed: uploads are sent directly */}
    </div>
  )
}


