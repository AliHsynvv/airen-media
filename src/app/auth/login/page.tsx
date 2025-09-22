'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Prefetch profile route for instant navigation after login
    try { router.prefetch?.('/profile') } catch {}
  }, [router])

  const submit = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setMessage('Giriş başarılı!')
      // Client-side navigation for faster transition
      router.push('/profile')
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
          <div className="text-lg lg:text-3xl font-bold tracking-tight">Welcome back</div>
          <div className="text-[11px] lg:text-sm text-white/80">Sign in to continue your journey with Airen.</div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-start lg:items-center justify-center p-4 sm:p-8 bg-white">
        <div className="w-full max-w-md rounded-2xl border border-gray-100/80 bg-white/80 backdrop-blur p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Giriş Yap</h1>
          <div className="space-y-3">
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
              <Button onClick={submit} className="rounded-full px-5 bg-black text-white hover:bg-black/90" disabled={loading || !email || !password}>
                {loading ? 'Yükleniyor...' : 'Giriş Yap'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">Hesabın yok mu? <Link href="/auth/register" className="underline">Kayıt ol</Link></p>
        </div>
      </div>
    </div>
  )
}


