'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setMessage('Giriş başarılı!')
      window.location.href = '/'
    } catch (e: any) {
      setMessage(`Hata: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <h1 className="text-2xl font-semibold text-white mb-6">Giriş Yap</h1>
      <div className="glass-card p-6 rounded-xl space-y-4">
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
          <Button onClick={submit} variant="neon" disabled={loading || !email || !password}>
            {loading ? 'Yükleniyor...' : 'Giriş Yap'}
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4">Hesabın yok mu? <Link href="/auth/register" className="text-airen-blue">Kayıt ol</Link></p>
    </div>
  )
}


