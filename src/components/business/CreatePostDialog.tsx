'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function CreatePostDialog({ businessId, onCreated }: { businessId: string; onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [schedule, setSchedule] = useState('')
  const [loading, setLoading] = useState(false)
  const [mediaIds, setMediaIds] = useState<string[]>([])
  const mediaInputRef = useRef<HTMLInputElement | null>(null)
  const mediaInputId = useId()
  const [mediaBusy, setMediaBusy] = useState(false)
  const [mediaMsg, setMediaMsg] = useState<string | null>(null)

  const submit = async () => {
    if (!title) return
    setLoading(true)
    try {
      const res = await fetch('/api/business/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_id: businessId, title: title || undefined, content: content || undefined, scheduled_at: schedule || undefined, media_ids: mediaIds }) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Kayıt hatası')
      }
      setOpen(false)
      setTitle('')
      setContent('')
      setSchedule('')
      setMediaIds([])
      onCreated?.()
      try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('business:post-created')) } catch {}
    } catch (e) {
      alert((e as any)?.message || 'Hata')
    } finally {
      setLoading(false)
    }
  }

  // Open dialog when URL hash is #new-post
  useEffect(() => {
    const check = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#new-post') {
        setOpen(true)
      }
    }
    check()
    const handler = () => check()
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  return (
    <div>
      <Button onClick={() => setOpen(true)} className="rounded-full">Yeni Gönderi</Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Gönderi Oluştur</div>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">Kapat</button>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Başlık</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" placeholder="(Opsiyonel) Başlık" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Metin</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full rounded-md border border-gray-200 px-3 py-2" placeholder="(Opsiyonel) Metin" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Zamanlama (opsiyonel)</label>
              <input type="datetime-local" value={schedule} onChange={e => setSchedule(e.target.value)} className="w-full h-10 rounded-md border border-gray-200 px-3" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Medya (opsiyonel)</label>
              <input id={mediaInputId} ref={mediaInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={async e => {
                const files = e.target.files
                if (!files || files.length === 0) return
                setMediaBusy(true)
                setMediaMsg(null)
                try {
                  const { data: userRes } = await fetch('/api/business/has').then(r => r.json()).catch(() => ({ data: null }))
                } catch {}
                try {
                  const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser()
                  const uid = user?.id
                  if (!uid) throw new Error('Oturum bulunamadı')
                  const envBucket = (process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUSINESS as string) || ''
                  let bucket = envBucket || 'business'
                  const uploadedIds: string[] = []
                  for (let i = 0; i < files.length; i++) {
                    const f = files[i]
                    const isVideo = (f.type || '').startsWith('video')
                    const ext = f.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg')
                    const path = `${businessId}/post/${Date.now()}-${i}.${ext}`
                    let usedBucket = bucket
                    let { error: upErr } = await (await import('@/lib/supabase/client')).supabase.storage.from(bucket).upload(path, f, { upsert: true, contentType: f.type })
                    if (upErr && /Bucket not found/i.test(String(upErr?.message || ''))) {
                      const alt = bucket === 'Business' ? 'business' : 'Business'
                      const { error: upErr2 } = await (await import('@/lib/supabase/client')).supabase.storage.from(alt).upload(path, f, { upsert: true, contentType: f.type })
                      if (!upErr2) usedBucket = alt; else throw upErr
                    } else if (upErr) {
                      throw upErr
                    }
                    const { data: pub } = (await import('@/lib/supabase/client')).supabase.storage.from(usedBucket).getPublicUrl(path)
                    const url = pub?.publicUrl || null
                    if (!url) throw new Error('Public URL alınamadı')
                    const { data: row, error: insErr } = await (await import('@/lib/supabase/client')).supabase.from('business_media').insert({
                      business_id: businessId,
                      storage_path: path,
                      url,
                      media_type: isVideo ? 'video' : 'image',
                      created_by: uid,
                    }).select('id').single()
                    if (insErr) throw insErr
                    uploadedIds.push(row.id)
                  }
                  setMediaIds(uploadedIds)
                  setMediaMsg(`${uploadedIds.length} medya eklendi`)
                } catch (e: any) {
                  setMediaMsg(e?.message || 'Medya yükleme hatası')
                } finally {
                  setMediaBusy(false)
                }
              }} />
              <div className="flex items-center gap-2">
                <label htmlFor={mediaInputId} className={`inline-flex items-center h-9 rounded-md border px-3 cursor-pointer ${mediaBusy ? 'opacity-50 pointer-events-none' : ''}`}>Medya Seç</label>
                {mediaMsg && <span className="text-sm text-gray-600">{mediaMsg}</span>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>İptal</Button>
              <Button onClick={submit} disabled={loading} className="rounded-full">{loading ? 'Kaydediliyor…' : 'Kaydet'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


