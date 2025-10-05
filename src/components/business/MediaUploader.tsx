'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type UploadItem = {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

export default function MediaUploader({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<UploadItem[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Open when hash is #upload-media
  useEffect(() => {
    const check = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#upload-media') {
        setOpen(true)
      }
    }
    check()
    const handler = () => check()
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const chooseFiles = () => inputRef.current?.click()

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const next: UploadItem[] = Array.from(files).map(f => ({ file: f, progress: 0, status: 'pending' }))
    setItems(next)
  }

  const uploadAll = async () => {
    if (items.length === 0 || busy) return
    setBusy(true)
    setMessage(null)
    try {
      const { data: userRes } = await supabase.auth.getUser()
      const userId = userRes.user?.id
      if (!userId) throw new Error('Oturum bulunamadı')

      const envBucket = (process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUSINESS as string) || ''
      let bucket = envBucket || 'business'
      // mark all as uploading to avoid stuck 'pending'
      setItems(prev => prev.map(it => ({ ...it, status: 'uploading', progress: 5 })))
      for (let i = 0; i < items.length; i++) {
        const entry = items[i]
        const file = entry.file
        const isVideo = (file.type || '').startsWith('video')
        const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg')
        const path = `${businessId}/gallery/${Date.now()}-${i}.${ext}`

        // upload (with casing fallback)
        let usedBucket = bucket
        let { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type })
        if (upErr && /Bucket not found/i.test(String(upErr?.message || ''))) {
          const alt = bucket === 'Business' ? 'business' : 'Business'
          const { error: upErr2 } = await supabase.storage.from(alt).upload(path, file, { upsert: true, contentType: file.type })
          if (!upErr2) usedBucket = alt; else throw upErr
        } else if (upErr) {
          throw upErr
        }

        const { data: pub } = supabase.storage.from(usedBucket).getPublicUrl(path)
        const url = pub?.publicUrl || null
        if (!url) throw new Error('Public URL alınamadı')

        const { error: insErr } = await supabase.from('business_media').insert({
          business_id: businessId,
          storage_path: path,
          url,
          media_type: isVideo ? 'video' : 'image',
          created_by: userId,
        })
        if (insErr) throw insErr
        setItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'done', progress: 100 } : it))
      }
      setMessage('Yükleme tamamlandı')
    } catch (e: any) {
      setMessage(e?.message || 'Yükleme hatası')
      setItems(prev => prev.map(it => it.status !== 'done' ? { ...it, status: 'error', error: 'Hata' } : it))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => onFiles(e.target.files)} />
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => { setOpen(false); if (window.location.hash === '#upload-media') history.replaceState(null, '', ' ') }} />
          <div className="w-full max-w-md h-full bg-white border-l border-gray-100 p-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Medya Yükle</div>
              <button onClick={() => { setOpen(false); if (window.location.hash === '#upload-media') history.replaceState(null, '', ' ') }} className="text-gray-500 hover:text-gray-700">Kapat</button>
            </div>
            <div className="mt-3 space-y-3">
              <Button onClick={chooseFiles} disabled={busy}>Dosya Seç</Button>
              <Button onClick={uploadAll} disabled={busy || items.length === 0}>Yüklemeyi Başlat</Button>
              {message && <div className="text-sm text-gray-600">{message}</div>}
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="border rounded-md p-2">
                    <div className="text-sm truncate">{it.file.name}</div>
                    <div className="h-2 bg-gray-100 rounded">
                      <div className="h-2 bg-gray-900 rounded" style={{ width: `${it.progress}%` }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{it.status}</div>
                  </div>
                ))}
                {items.length === 0 && <div className="text-sm text-gray-500">Dosya seçin.</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


