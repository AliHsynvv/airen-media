'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminNewsCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [tags, setTags] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
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

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

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

  const submit = async (isDraft = false) => {
    setLoading(true)
    setMessage(null)
    try {
      const payload: any = {
        title,
        content,
        excerpt: excerpt || undefined,
        type: 'news',
        status: isDraft ? 'draft' : 'published',
        tag_names: tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      if (featuredImage) payload.featured_image = featuredImage
      if (categoryId) payload.category_id = categoryId
      
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Hata')
      setMessage({ 
        text: isDraft ? 'Taslak olarak kaydedildi!' : 'Haber başarıyla yayınlandı!', 
        type: 'success' 
      })
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push('/admin/news')
        router.refresh()
      }, 1500)
    } catch (e: any) {
      setMessage({ text: `Hata: ${e.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const charCount = content.length
  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/admin/news">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </Button>
        <div>
            <h1 className="text-xl font-bold text-gray-900">Yeni Haber</h1>
            <p className="text-xs text-gray-500">Haber makalesi ekle</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => submit(true)} 
            variant="outline"
            disabled={loading || !title || !content}
            className="border-gray-300"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Taslak Kaydet
          </Button>
          <Button 
            onClick={() => submit(false)} 
            disabled={loading || !title || !content}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {loading ? 'Yayınlanıyor...' : 'Yayınla'}
          </Button>
        </div>
      </div>

      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300 ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md`}>
          {message.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Başlık *
            </label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Haber başlığını buraya yazın..." 
              className="text-lg font-semibold h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">{title.length}/100 karakter</p>
          </div>

          {/* Excerpt Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Kısa Özet
            </label>
            <Input 
              value={excerpt} 
              onChange={e => setExcerpt(e.target.value)} 
              placeholder="Haberin kısa özetini yazın (opsiyonel)" 
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">Bu özet, haber kartlarında görünecek</p>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Haber İçeriği *
            </label>
            <Textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              rows={16} 
              placeholder="Haber içeriğini buraya yazın..." 
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {wordCount} kelime • {charCount} karakter
              </p>
              {content.length > 0 && (
                <Badge variant={content.length > 500 ? 'default' : 'outline'} className="text-xs">
                  {content.length > 500 ? '✓ Yeterli' : '⚠ Çok kısa'}
                </Badge>
              )}
        </div>
        </div>

          {/* Featured Image Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Kapak Görseli
            </label>
            
            {featuredImage ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={featuredImage} 
                  alt="preview" 
                  className="w-full h-64 rounded-lg object-cover border border-gray-200" 
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                  <label className="px-4 py-2 bg-white text-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors font-medium">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Değiştir
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                        setUploading(true)
                        try {
                          const url = await upload(f)
                          setFeaturedImage(url)
                          setMessage({ text: 'Görsel başarıyla yüklendi!', type: 'success' })
                        } catch (err: any) {
                          setMessage({ text: `Upload hatası: ${err.message}`, type: 'error' })
                        } finally {
                          setUploading(false)
                        }
                      }}
                    />
                  </label>
                  <button 
                    onClick={() => setFeaturedImage('')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <>
                      <svg className="w-12 h-12 text-blue-500 animate-spin mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <p className="text-sm text-gray-500">Yükleniyor...</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-700 font-medium">
                        <span className="text-blue-600">Yüklemek için tıklayın</span> veya sürükleyip bırakın
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    setUploading(true)
                  try {
                    const url = await upload(f)
                    setFeaturedImage(url)
                      setMessage({ text: 'Görsel başarıyla yüklendi!', type: 'success' })
                  } catch (err: any) {
                      setMessage({ text: `Upload hatası: ${err.message}`, type: 'error' })
                  } finally {
                      setUploading(false)
                    }
                  }}
                />
              </label>
            )}
            
            <div className="mt-3">
              <Input 
                value={featuredImage} 
                onChange={e => setFeaturedImage(e.target.value)} 
                placeholder="veya görsel URL'si girin..." 
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Category Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Kategori
            </label>
            <select 
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)} 
              className="w-full h-10 rounded-lg border border-gray-300 bg-white text-gray-900 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Kategori seçin</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Tags Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Etiketler
            </label>
            <Input 
              value={tags} 
              onChange={e => setTags(e.target.value)} 
              placeholder="vize, turizm, istatistik" 
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">Virgülle ayırarak birden fazla etiket ekleyin</p>
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tagList.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">İstatistikler</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Kelime</span>
                <span className="text-sm font-semibold text-gray-900">{wordCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Karakter</span>
                <span className="text-sm font-semibold text-gray-900">{charCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Etiket</span>
                <span className="text-sm font-semibold text-gray-900">{tagList.length}</span>
        </div>
        <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Görsel</span>
                <span className="text-sm font-semibold text-gray-900">{featuredImage ? '✓' : '✗'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



