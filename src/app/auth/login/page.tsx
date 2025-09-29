'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const watcherRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    // Prefetch profile route for instant navigation after login
    try { router.prefetch?.('/profile') } catch {}
    return () => { mountedRef.current = false; if (watcherRef.current) window.clearInterval(watcherRef.current) }
  }, [router])

  const submit = async () => {
    if (loading) return
    setLoading(true)
    setMessage(null)
    const emailNorm = email.trim().toLowerCase()

    // Start a session watcher that navigates as soon as user appears
    const start = Date.now()
    if (watcherRef.current) window.clearInterval(watcherRef.current)
    watcherRef.current = window.setInterval(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          if (watcherRef.current) { window.clearInterval(watcherRef.current); watcherRef.current = null }
          if (!mountedRef.current) return
          router.replace('/profile')
        }
      } catch {}
      if (Date.now() - start > 60000 && watcherRef.current) { // hard cap 60s
        window.clearInterval(watcherRef.current)
        watcherRef.current = null
      }
    }, 1000)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: emailNorm, password })
      if (error) throw error
      setMessage('Giriş başarılı!')
      // Best-effort immediate check
      const { data } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))
      if (data?.user) router.replace('/profile')
    } catch (e: any) {
      const msg = e?.message || 'Beklenmeyen hata'
      // If user is already logged in despite error, watcher will handle redirect
      setMessage(`Hata: ${msg}`)
    } finally {
      if (mountedRef.current) setLoading(false)
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
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-gray-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
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


