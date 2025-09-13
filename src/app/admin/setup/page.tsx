'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AdminSetupPage() {
  const [email, setEmail] = useState('admin@airen.app')
  const [password, setPassword] = useState('StrongPass123!')
  const [username, setUsername] = useState('airenadmin')
  const [fullName, setFullName] = useState('Airen Admin')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/bootstrap-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, full_name: fullName }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Hata')
      setMessage(`Admin oluşturuldu. ADMIN_AUTHOR_ID: ${json.data.id}`)
    } catch (e: any) {
      setMessage(`Hata: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-white mb-4">Admin Setup</h1>
      <div className="space-y-4 glass-card p-4 rounded-xl">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Email</label>
          <Input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Password</label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Username</label>
          <Input value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Full Name</label>
          <Input value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">{message}</div>
          <Button onClick={submit} variant="neon" disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Oluştur'}
          </Button>
        </div>
      </div>
    </div>
  )
}


