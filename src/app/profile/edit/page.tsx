'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { logoutAndRedirect } from '@/lib/auth/logout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil } from 'lucide-react'
import Link from 'next/link'

export default function ProfileEditPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [message, setMessage] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      if (!mounted) return
      if (!u) {
        setLoading(false)
        return
      }
      setUserId(u.id)
      setEmail(u.email || '')
      const { data: p } = await supabase.from('users_profiles').select('full_name,username,bio,avatar_url').eq('id', u.id).single()
      setFullName(p?.full_name || '')
      setUsername(p?.username || '')
      setBio(p?.bio || '')
      setAvatarUrl(p?.avatar_url || null)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const saveProfile = async () => {
    if (!userId) return
    setSaving(true)
    setMessage(null)
    try {
      // Update email if changed
      const { data: authUser } = await supabase.auth.getUser()
      if (authUser.user?.email !== email && email) {
        const { error: emailErr } = await supabase.auth.updateUser({ email })
        if (emailErr) throw emailErr
      }
      // Update profile fields
      const { error: profErr } = await supabase.from('users_profiles').update({ full_name: fullName, username, bio }).eq('id', userId)
      if (profErr) throw profErr
      setMessage('Profil güncellendi')
    } catch (e: any) {
      setMessage(e?.message || 'Güncelleme başarısız')
    } finally {
      setSaving(false)
    }
  }

  const onPickAvatar = () => fileInputRef.current?.click()
  const onAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setMessage(null)
    setUploadingAvatar(true)
    try {
      const path = `${userId}/${Date.now()}_${file.name}`
      const candidates = [process.env.NEXT_PUBLIC_AVATARS_BUCKET || 'avatars', 'Avatars']
      let usedBucket: string | null = null
      let lastErr: any = null
      for (const b of candidates) {
        const { error: upErr } = await supabase.storage.from(b).upload(path, file, { cacheControl: '3600', upsert: false })
        if (!upErr) { usedBucket = b; break }
        lastErr = upErr
      }
      if (!usedBucket) throw lastErr || new Error('Upload failed')
      const { data: pub } = supabase.storage.from(usedBucket).getPublicUrl(path)
      const finalUrl = pub.publicUrl
      const { error: updErr } = await supabase.from('users_profiles').update({ avatar_url: finalUrl }).eq('id', userId)
      if (updErr) throw updErr
      setAvatarUrl(finalUrl)
      setMessage('Profil fotoğrafı güncellendi')
    } catch (err: any) {
      setMessage(err?.message || 'Yükleme başarısız')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const updatePassword = async () => {
    if (!userId) return
    if (!newPassword || newPassword.length < 6) { setMessage('Şifre en az 6 karakter olmalı'); return }
    if (newPassword !== confirmPassword) { setMessage('Şifreler eşleşmiyor'); return }
    setSaving(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Şifre güncellendi')
    } catch (e: any) {
      setMessage(e?.message || 'Şifre güncellenemedi')
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    await logoutAndRedirect('/')
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Yükleniyor...</div>
  }

  if (!userId) {
    return <div className="container mx-auto px-4 py-8">Oturum bulunamadı.</div>
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/profile" className="text-gray-900 text-xl leading-none">×</Link>
        <div className="text-base font-semibold text-gray-900">Edit Profile</div>
        <button className="text-sm font-medium text-blue-600 disabled:text-gray-400" onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-28 w-28 rounded-full overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-700 text-3xl">{(fullName || email || 'U')[0]}</div>
            )}
            <button onClick={onPickAvatar} className="absolute bottom-1 right-1 h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onAvatarSelected} />
          <button onClick={onPickAvatar} className="mt-3 text-sm font-medium text-blue-600">{uploadingAvatar ? 'Uploading…' : 'Change Profile Photo'}</button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Full Name</label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Username</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="@janedoe" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full rounded-md border border-gray-200 bg-white text-gray-900 p-3 placeholder:text-gray-400" placeholder="Tell us about yourself" />
          </div>
        </div>

        {message && <div className="mt-4 text-sm text-gray-700">{message}</div>}
      </div>
    </div>
  )
}
