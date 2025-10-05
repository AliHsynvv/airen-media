'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type Props = {
  businessId: string
  currentProfileUrl?: string | null
  currentCoverUrl?: string | null
}

export default function BusinessProfileMedia({ businessId, currentProfileUrl, currentCoverUrl }: Props) {
  const [uploading, setUploading] = useState<'profile' | 'cover' | null>(null)
  const [profileUrl, setProfileUrl] = useState<string | undefined | null>(currentProfileUrl)
  const [coverUrl, setCoverUrl] = useState<string | undefined | null>(currentCoverUrl)
  const [error, setError] = useState<string | null>(null)
  const profileInputRef = useRef<HTMLInputElement | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)

  const handleUpload = async (file: File, kind: 'profile' | 'cover') => {
    try {
      setUploading(kind)
      setError(null)
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${businessId}/${kind}-${Date.now()}.${ext}`
      const envBucket = (process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUSINESS as string) || ''
      let bucket = envBucket || 'business'
      let usedBucket = bucket
      let { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type })
      if (upErr && /Bucket not found/i.test(String(upErr?.message || ''))) {
        // Fallback to common casing variant if user created 'Business' bucket
        const alt = bucket === 'Business' ? 'business' : 'Business'
        const { error: upErr2 } = await supabase.storage.from(alt).upload(path, file, { upsert: true, contentType: file.type })
        if (!upErr2) { usedBucket = alt } else { throw upErr }
      } else if (upErr) {
        throw upErr
      }
      const { data: pub } = supabase.storage.from(usedBucket).getPublicUrl(path)
      const url = pub?.publicUrl || null
      const updates: any = kind === 'profile' ? { profile_image_url: url } : { cover_image_url: url }
      const { error: updErr } = await supabase.from('business_profiles').update(updates).eq('id', businessId)
      if (updErr) throw updErr
      if (kind === 'profile') setProfileUrl(url)
      else setCoverUrl(url)
    } catch (e: any) {
      setError(e?.message || 'Yükleme hatası')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium mb-2">Profil Fotoğrafı</div>
          {profileUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileUrl} alt="Profil" className="w-full h-40 object-cover rounded-md" />
          ) : (
            <div className="w-full h-40 bg-gray-100 rounded-md" />
          )}
          <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleUpload(e.target.files[0], 'profile')} />
          <Button disabled={uploading !== null} onClick={() => profileInputRef.current?.click()} className="mt-2">{uploading === 'profile' ? 'Yükleniyor…' : 'Yükle'}</Button>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium mb-2">Kapak Fotoğrafı</div>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="Kapak" className="w-full h-40 object-cover rounded-md" />
          ) : (
            <div className="w-full h-40 bg-gray-100 rounded-md" />
          )}
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleUpload(e.target.files[0], 'cover')} />
          <Button disabled={uploading !== null} onClick={() => coverInputRef.current?.click()} className="mt-2">{uploading === 'cover' ? 'Yükleniyor…' : 'Yükle'}</Button>
        </div>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}
