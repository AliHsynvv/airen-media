'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { logoutAndRedirect } from '@/lib/auth/logout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfileEditPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  // UI-only placeholders (no backend wiring yet)
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [favoriteLocation, setFavoriteLocation] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
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
      // best effort split for UI placeholders
      try {
        const parts = (p?.full_name || '').split(' ')
        setFirstName(parts[0] || '')
        setLastName(parts.slice(1).join(' ') || '')
      } catch {}
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
      const combinedFullName = (() => {
        const fn = firstName.trim()
        const ln = lastName.trim()
        const merged = [fn, ln].filter(Boolean).join(' ')
        return merged || (fullName || '')
      })()
      // Update email if changed
      const { data: authUser } = await supabase.auth.getUser()
      if (authUser.user?.email !== email && email) {
        const { error: emailErr } = await supabase.auth.updateUser({ email })
        if (emailErr) throw emailErr
      }
      // Update profile fields
      const { data: updatedRows, error: profErr } = await supabase
        .from('users_profiles')
        .update({ full_name: combinedFullName, username, bio })
        .eq('id', userId)
        .select('full_name,username,bio,avatar_url')
      if (profErr) throw profErr
      let updated = (updatedRows as any[])?.[0]
      if (!updated) {
        const { data: upserted, error: upsertErr } = await supabase
          .from('users_profiles')
          .upsert({ id: userId, full_name: combinedFullName, username, bio }, { onConflict: 'id' })
          .select('full_name,username,bio,avatar_url')
        if (upsertErr) throw upsertErr
        updated = (upserted as any[])?.[0]
      }
      if (updated) {
        setFullName(updated.full_name || '')
        // keep first/last split in sync for the form
        try {
          const parts = (updated.full_name || '').split(' ')
          setFirstName(parts[0] || '')
          setLastName(parts.slice(1).join(' ') || '')
        } catch {}
        setUsername(updated.username || '')
        setBio(updated.bio || '')
        setAvatarUrl(updated.avatar_url || null)
      }
      setMessage('Profil güncellendi')
      try {
        router.push('/profile')
        router.refresh()
      } catch {}
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Oturum bulunamadı.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 px-6 py-4 shadow-md">
          <Link href="/profile" className="text-gray-900 text-3xl leading-none hover:text-gray-600 transition-colors">×</Link>
          <h1 className="text-lg font-bold text-gray-900">Profili Düzenle</h1>
          <button 
            className="text-sm font-semibold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 disabled:from-gray-400 disabled:to-gray-400 px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300" 
            onClick={saveProfile} 
            disabled={saving}
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-xl">
          {/* Avatar Section */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-2xl">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-900 text-4xl font-bold">
                    {(fullName || email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <button 
                onClick={onPickAvatar} 
                className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center ring-4 ring-white shadow-lg hover:scale-110 transition-transform duration-300"
              >
                <Pencil className="h-5 w-5" />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onAvatarSelected} />
            <button 
              onClick={onPickAvatar} 
              className="mt-4 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              {uploadingAvatar ? 'Yükleniyor…' : 'Profil Fotoğrafını Değiştir'}
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ad</label>
                <Input 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  placeholder="Adınız" 
                  className="h-11 rounded-xl border-2 border-gray-200 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Soyad</label>
                <Input 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  placeholder="Soyadınız" 
                  className="h-11 rounded-xl border-2 border-gray-200 focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kullanıcı Adı</label>
              <Input 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="@kullaniciadi" 
                className="h-11 rounded-xl border-2 border-gray-200 focus:border-gray-400 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Biyografi</label>
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                rows={4} 
                className="w-full rounded-xl border-2 border-gray-200 focus:border-gray-400 bg-white text-gray-900 p-4 placeholder:text-gray-400 focus:outline-none transition-colors resize-none" 
                placeholder="Kendinizden kısaca bahsedin..."
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Favori Lokasyon</label>
                <Input 
                  value={favoriteLocation} 
                  onChange={e => setFavoriteLocation(e.target.value)} 
                  placeholder="Şehir, Ülke" 
                  className="h-11 rounded-xl border-2 border-gray-200 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cinsiyet</label>
                <select 
                  value={gender} 
                  onChange={e => setGender(e.target.value)} 
                  className="w-full h-11 rounded-xl border-2 border-gray-200 focus:border-gray-400 bg-white text-gray-900 px-4 focus:outline-none transition-colors"
                >
                  <option value="">Seçiniz</option>
                  <option value="Female">Kadın</option>
                  <option value="Male">Erkek</option>
                  <option value="Other">Diğer</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label>
              <Input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="email@example.com" 
                className="h-11 rounded-xl border-2 border-gray-200 focus:border-gray-400 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon Numarası</label>
              <Input 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="+90 (555) 123-4567" 
                className="h-11 rounded-xl border-2 border-gray-200 focus:border-gray-400 transition-colors"
              />
            </div>
          </div>

          {message && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <p className="text-sm font-medium text-gray-900 text-center">{message}</p>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto h-11 px-8 rounded-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 font-semibold" 
            asChild
          >
            <Link href="/profile">İptal</Link>
          </Button>
          <Button 
            className="w-full sm:w-auto h-11 px-8 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 shadow-md hover:shadow-lg transition-all duration-300 font-semibold" 
            onClick={saveProfile} 
            disabled={saving}
          >
            {saving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  )
}
