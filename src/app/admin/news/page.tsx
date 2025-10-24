'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Note: Use admin API routes (service role) to bypass RLS and include drafts

interface Row {
  id: string
  title: string
  slug: string
  status: string
  published_at: string | null
}

interface Stats {
  total: number
  published: number
  draft: number
}

export default function AdminNewsListPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all')

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/admin/news/stats', { cache: 'no-store' })
      const json = await res.json()
      if (res.ok && json.success) {
        setStats(json.data)
      }
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('status', status)
      params.set('limit', '5000')
      const res = await fetch(`/api/admin/news?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      if (res.ok && json.success) {
        setRows(json.data || [])
      } else {
        console.error('❌ Error loading articles:', json.error)
      }
    } catch (error) {
      console.error('❌ Error loading articles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load()
    loadStats()
  }, [])

  // Refetch when status filter changes so we fetch all matching rows (not only latest 100)
  useEffect(() => {
    load()
  }, [status])

  // Refresh data when page becomes visible (e.g. after navigating back)
  useEffect(() => {
    const handleFocus = () => {
      load()
      loadStats()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const filtered = useMemo(() => {
    const query = q.toLowerCase()
    let list = !query
      ? rows
      : rows.filter(r => r.title.toLowerCase().includes(query) || r.slug.toLowerCase().includes(query))
    if (status !== 'all') list = list.filter(r => r.status === status)
    return list
  }, [rows, q, status])

  const remove = async (id: string) => {
    if (!confirm('Bu haberi silmek istediğinizden emin misiniz?')) return
    setMessage(null)
    const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok || !json.success) {
      setMessage({ text: json.error || 'Silme başarısız', type: 'error' })
    } else {
      setMessage({ text: 'Haber başarıyla silindi', type: 'success' })
      load()
      loadStats() // İstatistikleri yeniden yükle
    }
  }

  const formatDateTime = (s: string | null) => {
    if (!s) return '-'
    const d = new Date(s)
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' • ' + 
           d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Haber Yönetimi</h1>
              <p className="text-sm text-gray-500 mt-0.5">Yayınlanan ve taslak haberleri yönetin</p>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 transition-all">
          <Link href="/admin/news/create">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Haber Ekle
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Haber</p>
              {statsLoading ? (
                <div className="h-9 w-16 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total.toLocaleString('tr-TR')}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-green-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yayında</p>
              {statsLoading ? (
                <div className="h-9 w-16 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.published.toLocaleString('tr-TR')}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taslak</p>
              {statsLoading ? (
                <div className="h-9 w-16 bg-gray-200 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.draft.toLocaleString('tr-TR')}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input 
              placeholder="Haber ara..." 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
            />
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="h-11 pl-10 pr-10 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="published">✓ Yayında</option>
              <option value="draft">✎ Taslak</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300 ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md`}>
          {message.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Başlık</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Slug</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Yayın Tarihi</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4"><div className="h-5 w-64 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-5 w-40 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" /></td>
                    <td className="p-4"><div className="h-5 w-36 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-9 w-64 ml-auto bg-gray-200 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length ? filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 max-w-md">
                      {r.title}
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded font-mono">
                      /{r.slug}
                    </code>
                  </td>
                  <td className="p-4">
                    {r.status === 'published' ? (
                      <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-200">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Yayında
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Taslak
                      </Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDateTime(r.published_at)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Link href={`/articles/${r.slug}`}>
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Görüntüle
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                        <Link href={`/admin/news/${r.id}/edit`}>
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Düzenle
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Henüz haber yok</h3>
                      <p className="text-gray-500 mb-4">İlk haberinizi oluşturmak için başlayın</p>
                      <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                        <Link href="/admin/news/create">Yeni Haber Ekle</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse mb-4" />
              <div className="flex gap-2">
                <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
                <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : filtered.length ? (
          filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                  {r.title}
                </h3>
                {r.status === 'published' ? (
                  <Badge className="bg-green-100 text-green-700 border border-green-200 flex-shrink-0">
                    Yayında
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-200 flex-shrink-0">
                    Taslak
                  </Badge>
                )}
              </div>
              <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded block mb-2 font-mono">
                /{r.slug}
              </code>
              <div className="flex items-center text-xs text-gray-500 mb-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDateTime(r.published_at)}
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Link href={`/articles/${r.slug}`}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Görüntüle
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50">
                  <Link href={`/admin/news/${r.id}/edit`}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Düzenle
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-red-600 hover:bg-red-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Henüz haber yok</h3>
            <p className="text-gray-500 mb-4">İlk haberinizi oluşturmak için başlayın</p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
              <Link href="/admin/news/create">Yeni Haber Ekle</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}


