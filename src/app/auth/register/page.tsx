'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

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
            <div className="flex items-center gap-2 text-sm mb-1">
              <button type="button" onClick={() => setAccountType('user')} className={`px-3 py-1.5 rounded-full border ${!isBusiness ? 'bg-black text-white border-black' : 'bg-white text-gray-800 border-gray-200'}`}>Kullanıcı</button>
              <button type="button" onClick={() => setAccountType('business')} className={`px-3 py-1.5 rounded-full border ${isBusiness ? 'bg-black text-white border-black' : 'bg-white text-gray-800 border-gray-200'}`}>İşletme</button>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Kullanıcı Adı</label>
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="airenuser" className={`border-gray-200 ${usernameTaken ? 'ring-1 ring-red-500' : ''}`} />
              {username && (
                <div className="mt-1 text-xs">
                  {checkingUsername ? (
                    <span className="text-gray-500">Kontrol ediliyor…</span>
                  ) : usernameCheckError ? (
                    <span className="text-orange-600">Kontrol edilemedi. Tekrar deneyin.</span>
                  ) : usernameTaken ? (
                    <span className="text-red-600">Bu kullanıcı adı zaten alınmış.</span>
                  ) : username.length >= 3 ? (
                    <span className="text-green-600">Uygun.</span>
                  ) : null}
                </div>
              )}
            </div>
            {!isBusiness && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Ad Soyad</label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ad Soyad" className="border-gray-200" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Cinsiyet</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full h-10 rounded-md border border-gray-200 bg-white text-gray-900 px-3">
                    <option value="">Seçiniz</option>
                    <option value="Female">Kadın</option>
                    <option value="Male">Erkek</option>
                    <option value="Other">Diğer</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm text-gray-700 mb-1">E-posta</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="mail@site.com" className={`border-gray-200 ${emailTaken ? 'ring-1 ring-red-500' : ''}`} />
              {email && (
                <div className="mt-1 text-xs">
                  {checkingEmail ? (
                    <span className="text-gray-500">Kontrol ediliyor…</span>
                  ) : emailCheckError ? (
                    <span className="text-orange-600">Kontrol edilemedi. Tekrar deneyin.</span>
                  ) : emailTaken ? (
                    <span className="text-red-600">Bu e-posta zaten kayıtlı.</span>
                  ) : (
                    <span className="text-green-600">Uygun.</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Şifre</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="border-gray-200" />
            </div>
            {isBusiness && (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <div className="mt-1 grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">İşletme Adı</label>
                    <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Firma A.Ş." className="border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Kategori</label>
                    <Input value={businessCategory} onChange={e => setBusinessCategory(e.target.value)} placeholder="Cafe, Hotel, Tour..." className="border-gray-200" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Website</label>
                      <Input value={businessWebsite} onChange={e => setBusinessWebsite(e.target.value)} placeholder="https://site.com" className="border-gray-200" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">E-posta (İşletme)</label>
                      <Input value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} placeholder="biz@site.com" className="border-gray-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Telefon</label>
                    <Input value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" className="border-gray-200" />
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <div className="text-sm text-gray-500">{message}</div>
              <Button onClick={submit} className="rounded-full px-5 bg-black text-white hover:bg-black/90" disabled={
                loading || !email || !password || !username || emailTaken === true || usernameTaken === true || !!emailCheckError || !!usernameCheckError || (isBusiness && !businessName)
              }>
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


