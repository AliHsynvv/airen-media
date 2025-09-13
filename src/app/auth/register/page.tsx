'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username, full_name: fullName } } })
      if (error) throw error
      // Ensure profile via server (service role) to bypass RLS edge cases
      if (data.user) {
        await fetch('/api/auth/ensure-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: data.user.id, username, full_name: fullName }),
        })
      }
      setMessage('Kayıt başarılı! E-posta doğrulamasını tamamlayın.')
      window.location.href = '/auth/login'
    } catch (e: any) {
      setMessage(`Hata: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <h1 className="text-2xl font-semibold text-white mb-6">Kayıt Ol</h1>
      <div className="glass-card p-6 rounded-xl space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Kullanıcı Adı</label>
          <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="airenuser" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Ad Soyad</label>
          <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ad Soyad" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">E-posta</label>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="mail@site.com" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Şifre</label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">{message}</div>
          <Button onClick={submit} variant="neon" disabled={loading || !email || !password || !username}>
            {loading ? 'Yükleniyor...' : 'Kayıt Ol'}
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4">Hesabın var mı? <Link href="/auth/login" className="text-airen-blue">Giriş yap</Link></p>
    </div>
  )
}


