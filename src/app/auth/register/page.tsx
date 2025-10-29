'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, Lock, User, Building2, Phone, Globe, Briefcase, UserCircle2, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { PasswordStrength } from '@/components/ui/password-strength'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [usernameTaken, setUsernameTaken] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const userDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [emailTaken, setEmailTaken] = useState<boolean | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null)
  const [usernameCheckError, setUsernameCheckError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)
  const [gender, setGender] = useState('')
  const [accountType, setAccountType] = useState<'user' | 'business'>('user')
  const isBusiness = accountType === 'business'
  const [businessName, setBusinessName] = useState('')
  const [businessCategory, setBusinessCategory] = useState('')
  const [businessWebsite, setBusinessWebsite] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')

  useEffect(() => {
    const value = email.toLowerCase().trim()
    if (!value) { setEmailTaken(null); setEmailCheckError(null); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setCheckingEmail(true)
      try {
        const res = await fetch('/api/auth/check-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: value }) })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          setEmailCheckError(err?.error || 'Sunucu hatası')
          setEmailTaken(null)
        } else {
          const json = await res.json()
          setEmailTaken(!!json?.exists)
          setEmailCheckError(null)
        }
      } catch {
        setEmailCheckError('Ağ hatası')
        setEmailTaken(null)
      } finally {
        setCheckingEmail(false)
      }
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [email])

  useEffect(() => {
    const value = username.toLowerCase().trim()
    if (!value || value.length < 3) { setUsernameTaken(null); setUsernameCheckError(null); return }
    if (userDebounceRef.current) clearTimeout(userDebounceRef.current)
    userDebounceRef.current = setTimeout(async () => {
      setCheckingUsername(true)
      try {
        const res = await fetch('/api/auth/check-username', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: value }) })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          setUsernameCheckError(err?.error || 'Sunucu hatası')
          setUsernameTaken(null)
        } else {
          const json = await res.json()
          setUsernameTaken(!!json?.exists)
          setUsernameCheckError(null)
        }
      } catch {
        setUsernameCheckError('Ağ hatası')
        setUsernameTaken(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 400)
    return () => { if (userDebounceRef.current) clearTimeout(userDebounceRef.current) }
  }, [username])

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
    setLoading(true)
    setMessage(null)
    try {
      const normalized = email.toLowerCase().trim()
      // Final server-side check before attempt
      const pre = await fetch('/api/auth/check-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: normalized }) })
      if (!pre.ok) {
        const err = await pre.json().catch(() => ({}))
        setMessage(`E-posta kontrol hatası: ${err?.error || pre.status}`)
        setLoading(false)
        return
      }
      const preJson = await pre.json()
      if (preJson?.exists) {
        setMessage('Bu e-posta zaten kayıtlı.')
        setEmailTaken(true)
        setLoading(false)
        return
      }
      const uname = username.toLowerCase().trim()
      const preU = await fetch('/api/auth/check-username', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: uname }) })
      if (!preU.ok) {
        const err = await preU.json().catch(() => ({}))
        setMessage(`Kullanıcı adı kontrol hatası: ${err?.error || preU.status}`)
        setLoading(false)
        return
      }
      const preUJson = await preU.json()
      if (preUJson?.exists) {
        setMessage('Bu kullanıcı adı zaten alınmış.')
        setUsernameTaken(true)
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({ email: normalized, password, options: { data: { username, full_name: fullName, gender } } })
      if (error) throw error
      // Ensure profile via server (service role) to bypass RLS edge cases
      if (data.user) {
        await fetch('/api/auth/ensure-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: data.user.id, username, full_name: fullName, gender }),
        })
        if (isBusiness) {
          const bizRes = await fetch('/api/business/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              owner_id: data.user.id,
              name: businessName || fullName || username,
              category: businessCategory || undefined,
              website: businessWebsite || undefined,
              email: businessEmail || undefined,
              phone: businessPhone || undefined,
            }),
          })
          if (bizRes.ok) {
            window.location.href = '/business'
            return
          }
        }
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
              Seyahati Yeniden Keşfet
            </h2>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed">
              Akıllı seyahat deneyimi için topluluğumuza katıl
            </p>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Form Container */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-3xl">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  Kayıt Ol
                </h1>
                <p className="text-gray-600 text-sm">
                  Hesap oluştur ve keşfetmeye başla
                </p>
              </div>

              {/* Account Type Selector */}
              <div className="flex items-center gap-2 mb-6 p-1 bg-gray-100/80 rounded-full">
                <button 
                  type="button" 
                  onClick={() => setAccountType('user')} 
                  className={`flex-1 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    !isBusiness 
                      ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-900/30 scale-105' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <UserCircle2 className="w-4 h-4" />
                  Kullanıcı
                </button>
                <button 
                  type="button" 
                  onClick={() => setAccountType('business')} 
                  className={`flex-1 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    isBusiness 
                      ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-900/30 scale-105' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  İşletme
                </button>
              </div>

              <div className="space-y-5">
                {/* Username Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Kullanıcı Adı
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                    <Input 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      placeholder="airenuser" 
                      className={`pl-11 h-12 border-gray-200 bg-white/50 focus:bg-white transition-all duration-200 ${
                        usernameTaken ? 'border-red-400 focus:ring-red-400' : 'focus:border-gray-900'
                      }`} 
                    />
                    {username && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {checkingUsername ? (
                          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        ) : usernameCheckError ? (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        ) : usernameTaken ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : username.length >= 3 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {username && (
                    <div className="flex items-center gap-1.5 text-xs mt-1.5 animate-fade-in">
                      {checkingUsername ? (
                        <span className="text-gray-600 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Kontrol ediliyor...
                        </span>
                      ) : usernameCheckError ? (
                        <span className="text-orange-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Kontrol edilemedi
                        </span>
                      ) : usernameTaken ? (
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Bu kullanıcı adı alınmış
                        </span>
                      ) : username.length >= 3 ? (
                        <span className="text-green-600 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Kullanılabilir
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* User-specific fields */}
                {!isBusiness && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Ad Soyad
                      </label>
                      <div className="relative group">
                        <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                        <Input 
                          value={fullName} 
                          onChange={e => setFullName(e.target.value)} 
                          placeholder="Ad Soyad" 
                          className="pl-11 h-12 border-gray-200 bg-white/50 focus:bg-white focus:border-gray-900 transition-all duration-200" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cinsiyet
                      </label>
                      <div className="relative">
                        <select 
                          value={gender} 
                          onChange={e => setGender(e.target.value)} 
                          className="w-full h-12 rounded-lg border border-gray-200 bg-white/50 text-gray-900 px-4 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="">Seçiniz</option>
                          <option value="Female">Kadın</option>
                          <option value="Male">Erkek</option>
                          <option value="Other">Diğer</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                )}

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
                      className={`pl-11 h-12 border-gray-200 bg-white/50 focus:bg-white transition-all duration-200 ${
                        emailTaken ? 'border-red-400 focus:ring-red-400' : 'focus:border-gray-900'
                      }`} 
                    />
                    {email && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {checkingEmail ? (
                          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        ) : emailCheckError ? (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        ) : emailTaken ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {email && (
                    <div className="flex items-center gap-1.5 text-xs mt-1.5 animate-fade-in">
                      {checkingEmail ? (
                        <span className="text-gray-600 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Kontrol ediliyor...
                        </span>
                      ) : emailCheckError ? (
                        <span className="text-orange-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Kontrol edilemedi
                        </span>
                      ) : emailTaken ? (
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Bu e-posta kayıtlı
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Kullanılabilir
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Şifre
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                    <Input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="pl-11 h-12 border-gray-200 bg-white/50 focus:bg-white focus:border-gray-900 transition-all duration-200" 
                    />
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && <PasswordStrength password={password} />}
                </div>

                {/* Business-specific fields */}
                {isBusiness && (
                  <div className="pt-4 border-t border-gray-200 space-y-4 animate-fade-in">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      İşletme Bilgileri
                    </h3>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        İşletme Adı *
                      </label>
                      <div className="relative group">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                        <Input 
                          value={businessName} 
                          onChange={e => setBusinessName(e.target.value)} 
                          placeholder="Firma A.Ş." 
                          className="pl-11 h-12 border-gray-200 bg-white/50 focus:bg-white focus:border-gray-900 transition-all duration-200" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Kategori
                      </label>
                      <div className="relative group">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                        <Input 
                          value={businessCategory} 
                          onChange={e => setBusinessCategory(e.target.value)} 
                          placeholder="Cafe, Hotel, Tour..." 
                          className="pl-11 h-12 border-gray-200 bg-white/50 focus:bg-white focus:border-gray-900 transition-all duration-200" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Website
                        </label>
                        <div className="relative group">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                          <Input 
                            value={businessWebsite} 
                            onChange={e => setBusinessWebsite(e.target.value)} 
                            placeholder="https://site.com" 
                            className="pl-11 h-12 border-gray-200 bg-white/50 focus:bg-white focus:border-gray-900 transition-all duration-200" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          E-posta (İşletme)
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                          <Input 
                            value={businessEmail} 
                            onChange={e => setBusinessEmail(e.target.value)} 
                            placeholder="biz@site.com" 
                            className="pl-11 h-12 border-gray-200 bg-white/50 focus:bg-white focus:border-gray-900 transition-all duration-200" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Telefon
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                        <Input 
                          value={businessPhone} 
                          onChange={e => setBusinessPhone(e.target.value)} 
                          placeholder="+90 5xx xxx xx xx" 
                          className="pl-11 h-12 border-gray-200 bg-white/50 focus:bg-white focus:border-gray-900 transition-all duration-200" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error/Success Message */}
                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${
                    message.includes('başarılı') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  onClick={submit} 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg shadow-gray-900/30 hover:shadow-xl hover:shadow-gray-900/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                  disabled={
                    loading || !email || !password || !username || emailTaken === true || usernameTaken === true || !!emailCheckError || !!usernameCheckError || (isBusiness && !businessName)
                  }
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      İşleniyor...
                    </span>
                  ) : (
                    'Kayıt Ol'
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
                      <span>Google ile kayıt ol</span>
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
                      <span>Apple ile kayıt ol</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Hesabın var mı?{' '}
                  <Link 
                    href="/auth/login" 
                    className="font-semibold text-gray-900 hover:underline transition-all"
                  >
                    Giriş yap
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


