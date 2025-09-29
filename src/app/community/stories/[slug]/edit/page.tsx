'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'

export default function StoryEditPage() {
  const params = useParams() as { slug: string }
  const router = useRouter()
  const slug = params?.slug
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [storyId, setStoryId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [category, setCategory] = useState<string | null>('culture')
  const [tags, setTags] = useState<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser()
        const me = userRes.user
        if (!me) { router.replace('/auth/login'); return }
        const { data: s } = await supabase
          .from('user_stories')
          .select('id,title,content,image_url,location,category,tags,user_id')
          .eq('slug', slug)
          .single()
        if (!s) { setMessage('Hikaye bulunamadı'); return }
        if (s.user_id !== me.id) { setMessage('Bu hikayeyi düzenleme yetkiniz yok'); return }
        if (!mounted) return
        setStoryId(s.id)
        setTitle(s.title || '')
        setContent(s.content || '')
        setImageUrl(s.image_url || null)
        setLocation(s.location || null)
        setCategory(s.category || null)
        setTags(Array.isArray(s.tags) ? (s.tags as string[]).join(', ') : (s.tags || ''))
      } catch (e: any) {
        setMessage(e?.message || 'Yükleme hatası')
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [slug, router])

  const save = async () => {
    if (!storyId) return
    setSaving(true)
    setMessage(null)
    try {
      const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
      const { error } = await supabase
        .from('user_stories')
        .update({
          title,
          content,
          image_url: imageUrl,
          location,
          category,
          tags: tagsArray,
        })
        .eq('id', storyId)
      if (error) throw error
      setMessage('Kaydedildi')
      router.replace(`/community/stories/${slug}`)
    } catch (e: any) {
      setMessage(e?.message || 'Kaydetme hatası')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto w-full max-w-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Geri
          </button>
          <div className="text-base font-semibold text-gray-900">Hikayeyi Düzenle</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="h-9 px-4 rounded-full border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
              disabled={saving}
            >
              İptal
            </Button>
            <Button onClick={save} disabled={saving || loading} className="h-9 px-5 rounded-full bg-black text-white hover:bg-black/90">
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">Yükleniyor...</div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-5 shadow-sm">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Başlık</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn. Kapadokya’da gün doğumu" className="border-gray-200" />
                <p className="mt-1 text-xs text-gray-500">Kısa ve akılda kalıcı bir başlık önerilir.</p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">İçerik</label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Deneyimini anlat..." className="border-gray-200" />
              </div>

              {/* Media URL + Preview */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Görsel URL</label>
                <Input value={imageUrl || ''} onChange={e => setImageUrl(e.target.value || null)} placeholder="https://..." className="border-gray-200" />
                {imageUrl ? (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                    <div className="aspect-[4/5] w-full bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">Paylaşım kapak görselinin tam URL’sini gir.</p>
                )}
              </div>

              {/* Location & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Konum</label>
                  <Input value={location || ''} onChange={e => setLocation(e.target.value || null)} placeholder="İstanbul, Türkiye" className="border-gray-200" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Kategori</label>
                  <Input value={category || ''} onChange={e => setCategory(e.target.value || null)} placeholder="culture" className="border-gray-200" />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Etiketler (virgülle)</label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="#design, #travel" className="border-gray-200" />
                <p className="mt-1 text-xs text-gray-500">Örn: #travel, #food, #nature</p>
              </div>

              {message && <div className="text-sm text-gray-600">{message}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


