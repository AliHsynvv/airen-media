'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { PasswordStrength } from '@/components/ui/password-strength'

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
    try { router.prefetch?.('/profile'); router.prefetch?.('/business') } catch {}
    return () => { mountedRef.current = false; if (watcherRef.current) window.clearInterval(watcherRef.current) }
  }, [router])

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    if (loading) return
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (e: any) {
      const msg = e?.message || 'Beklenmeyen hata'
      setMessage(`Hata: ${msg}`)
      setLoading(false)
    }
  }

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
          // Check if user owns a business
          try {
            const res = await fetch('/api/business/has', { method: 'GET' })
            const j = await res.json().catch(() => ({}))
            if (j?.has === true) {
              router.replace('/business')
            } else {
              router.replace('/profile')
            }
          } catch {
            router.replace('/profile')
          }
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
      if (data?.user) {
        try {
          const res = await fetch('/api/business/has', { method: 'GET' })
          const j = await res.json().catch(() => ({}))
          if (j?.has === true) {
            router.replace('/business')
          } else {
            router.replace('/profile')
          }
        } catch {
          router.replace('/profile')
        }
      }
    } catch (e: any) {
      const msg = e?.message || 'Beklenmeyen hata'
      // If user is already logged in despite error, watcher will handle redirect
      setMessage(`Hata: ${msg}`)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-100 to-orange-100 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side - Video/Hero Section */}
        <div className="relative h-64 sm:h-80 lg:h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src="/Airen%208.mp4"
              playsInline
              loop
              muted
              autoPlay
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50 backdrop-blur-[1px]" />
          </div>
          
          <div className="relative z-10 text-center px-6 sm:px-8 lg:px-16 max-w-xl">
            <div className="inline-block p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 animate-fade-in">
              <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent tracking-tight">
                AIREN
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Tekrar Hoş Geldin
            </h2>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed">
              Seyahat macerana kaldığın yerden devam et
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Form Container */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-3xl">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  Giriş Yap
                </h1>
                <p className="text-gray-600 text-sm">
                  Hesabına giriş yap ve keşfetmeye devam et
                </p>
              </div>

              <div className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    E-posta
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                    <Input 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="mail@site.com" 
                      type="email"
                      className="pl-11 h-12 border-gray-200 bg-white/50 focus:bg-white focus:border-gray-900 transition-all duration-200" 
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Şifre
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-11 pr-11 h-12 border-gray-200 bg-white/50 focus:bg-white focus:border-gray-900 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                      aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && <PasswordStrength password={password} />}
                </div>

                {/* Error/Success Message */}
                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${
                    message.includes('başarılı') 
                      ? 'bg-green-50 text-green-800 border border-green-200 flex items-center gap-2' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message.includes('başarılı') && <CheckCircle2 className="w-4 h-4" />}
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  onClick={submit} 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg shadow-gray-900/30 hover:shadow-xl hover:shadow-gray-900/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                  disabled={loading || !email || !password}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Giriş yapılıyor...
                    </span>
                  ) : (
                    'Giriş Yap'
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-gray-500 font-medium">veya</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                  {/* Google Login */}
                  <Button
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Google ile giriş yap</span>
                    </div>
                  </Button>

                  {/* Apple Login */}
                  <Button
                    onClick={() => handleSocialLogin('apple')}
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      <span>Apple ile giriş yap</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Hesabın yok mu?{' '}
                  <Link 
                    href="/auth/register" 
                    className="font-semibold text-gray-900 hover:underline transition-all"
                  >
                    Kayıt ol
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


