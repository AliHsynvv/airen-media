'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function ProfileEditPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [message, setMessage] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)

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
      const { data: p } = await supabase.from('users_profiles').select('full_name,username,bio').eq('id', u.id).single()
      setFullName(p?.full_name || '')
      setUsername(p?.username || '')
      setBio(p?.bio || '')
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
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Yükleniyor...</div>
  }

  if (!userId) {
    return <div className="container mx-auto px-4 py-8">Oturum bulunamadı.</div>
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Profili Düzenle</h1>
        <Link href="/profile" className="text-sm text-gray-700 hover:underline">Geri</Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 space-y-6">
        {/* Email & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Ad Soyad</label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ad Soyad" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Kullanıcı Adı</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="kullanici" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">E-posta</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@mail.com" />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Biyografi</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} className="w-full rounded-md border border-gray-200 bg-white text-gray-900 p-2" placeholder="Kendini tanıt..." />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button className="h-9 px-4 bg-black text-white hover:bg-black/90" disabled={saving} onClick={saveProfile}>Kaydet</Button>
        </div>

        {/* Password */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-2">Şifreyi Güncelle</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Yeni Şifre</label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="******" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Yeni Şifre (Tekrar)</label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="******" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-2">
            <Button variant="secondary" className="h-9 px-4 border border-gray-200 bg-white text-black hover:bg-gray-50" disabled={saving} onClick={updatePassword}>Şifreyi Güncelle</Button>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-2">Hesap</div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Oturumu kapat</div>
            <Button variant="destructive" className="h-9 px-4" onClick={logout}>Çıkış Yap</Button>
          </div>
        </div>

        {message && <div className="text-sm text-gray-700">{message}</div>}
      </div>
    </div>
  )
}
