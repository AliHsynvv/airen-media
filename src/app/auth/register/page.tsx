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
    <div className="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-b from-white to-gray-50">
      {/* Video (top on mobile, full column on desktop) */}
      <div className="relative h-48 sm:h-60 lg:h-auto block overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-none lg:rounded-r-2xl border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/Airen%208.mp4"
          playsInline
          loop
          muted
          autoPlay
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/0 to-black/25" />
        <div className="absolute bottom-3 left-4 text-white hidden sm:block lg:block lg:bottom-10 lg:left-10">
          <div className="text-lg lg:text-3xl font-bold tracking-tight">Join Airen</div>
          <div className="text-[11px] lg:text-sm text-white/80">Create an account to explore smarter travel.</div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-start lg:items-center justify-center p-4 sm:p-8 bg-white">
        <div className="w-full max-w-md rounded-2xl border border-gray-100/80 bg-white/80 backdrop-blur p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Kayıt Ol</h1>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Kullanıcı Adı</label>
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="airenuser" className="border-gray-200" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Ad Soyad</label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ad Soyad" className="border-gray-200" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">E-posta</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="mail@site.com" className="border-gray-200" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Şifre</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="border-gray-200" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="text-sm text-gray-500">{message}</div>
              <Button onClick={submit} className="rounded-full px-5 bg-black text-white hover:bg-black/90" disabled={loading || !email || !password || !username}>
                {loading ? 'Yükleniyor...' : 'Kayıt Ol'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">Hesabın var mı? <Link href="/auth/login" className="underline">Giriş yap</Link></p>
        </div>
      </div>
    </div>
  )
}


