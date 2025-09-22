'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X, User, Search, Globe, Bell, LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAndRedirect } from '@/lib/auth/logout'
import { ROUTES } from '@/lib/utils/constants'
import { supabase } from '@/lib/supabase/client'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string | null; username?: string | null; avatar_url?: string | null } | null>(null)
  const [unreadCount, setUnreadCount] = useState<number>(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const id = data.user?.id ?? null
      if (!mounted) return
      setUserId(id)
      if (id) {
        const { data: p } = await supabase.from('users_profiles').select('full_name,username,avatar_url').eq('id', id).single()
        if (mounted) setProfile(p || null)
        const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', id).eq('is_read', false)
        if (mounted) {
          setUnreadCount(count || 0)
          try { localStorage.setItem('unread_notifications', String(count || 0)) } catch {}
        }
      } else {
        setProfile(null)
        setUnreadCount(0)
        try { localStorage.setItem('unread_notifications', '0') } catch {}
      }
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  // Realtime: update unread notifications count instantly
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`notif-badge-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => {
        setUnreadCount(c => {
          const next = (c || 0) + 1
          try { localStorage.setItem('unread_notifications', String(next)) } catch {}
          return next
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload: any) => {
        const oldRead = !!payload?.old?.is_read
        const newRead = !!payload?.new?.is_read
        if (!oldRead && newRead) setUnreadCount(c => {
          const next = Math.max(0, (c || 0) - 1)
          try { localStorage.setItem('unread_notifications', String(next)) } catch {}
          return next
        })
        if (oldRead && !newRead) setUnreadCount(c => {
          const next = (c || 0) + 1
          try { localStorage.setItem('unread_notifications', String(next)) } catch {}
          return next
        })
      })
      .subscribe()
    return () => { try { channel.unsubscribe() } catch {} }
  }, [userId])

  // Listen for explicit notification updates from other pages (fallback if realtime misses)
  useEffect(() => {
    const onUpdate = (e: any) => {
      const count = typeof e?.detail?.count === 'number' ? e.detail.count : 0
      setUnreadCount(count)
      try { localStorage.setItem('unread_notifications', String(count)) } catch {}
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'unread_notifications' && e.newValue != null) {
        const n = parseInt(e.newValue)
        if (!Number.isNaN(n)) setUnreadCount(n)
      }
    }
    try {
      const v = localStorage.getItem('unread_notifications')
      if (v != null) {
        const n = parseInt(v)
        if (!Number.isNaN(n)) setUnreadCount(n)
      }
    } catch {}
    window.addEventListener('notifications:update', onUpdate as any)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('notifications:update', onUpdate as any)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const navigation = [
    { name: 'Ana Sayfa', href: ROUTES.HOME },
    { name: 'Haberler', href: ROUTES.NEWS },
    { name: 'Ülkeler', href: ROUTES.COUNTRIES },
    { name: 'Topluluk', href: ROUTES.COMMUNITY },
    { name: 'Etkileşim', href: ROUTES.INTERACTION },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href={ROUTES.HOME} 
              className="flex items-center space-x-2 focus-ring rounded-lg p-1"
            >
              <Globe className="h-7 w-7 text-gray-700" />
              <span className="text-xl font-semibold text-gray-900">
                Airen
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium focus-ring rounded-lg px-2 py-1"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 relative">
            {/* Notifications */}
            {userId && (
              <Link href={ROUTES.NOTIFICATIONS} className="relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                <Bell className="h-5 w-5" />
              </Link>
            )}

            {/* Search Button */}
            <Button variant="ghost" size="icon" className="hidden md:flex text-gray-700 hover:text-gray-900">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* User Menu */}
            {userId ? (
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => setIsUserMenuOpen(v => !v)}>
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="avatar" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-gray-700" />
                  )}
                  <span className="sr-only">User menu</span>
                </Button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border border-gray-200 p-2 shadow-lg z-50">
                    <div className="px-2 py-1 text-xs text-gray-500 mb-1">
                      {profile?.full_name || profile?.username || 'Kullanıcı'}
                    </div>
                    <Link href={ROUTES.PROFILE} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md" onClick={() => setIsUserMenuOpen(false)}>
                      Profil
                    </Link>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      onClick={async () => {
                        setIsUserMenuOpen(false)
                        await logoutAndRedirect('/')
                      }}
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Desktop auth links */}
                <div className="hidden md:flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-100">
                    <Link href={ROUTES.AUTH.LOGIN}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Giriş
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="rounded-full bg-gray-900 text-white hover:bg-black">
                    <Link href={ROUTES.AUTH.REGISTER}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Kayıt Ol
                    </Link>
                  </Button>
                </div>
                {/* Mobile auth buttons visible in header */}
                <div className="flex md:hidden items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-100">
                    <Link href={ROUTES.AUTH.LOGIN}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Giriş
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="rounded-full bg-gray-900 text-white hover:bg-black">
                    <Link href={ROUTES.AUTH.REGISTER}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Kayıt Ol
                    </Link>
                  </Button>
                </div>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              <span className="sr-only">
                {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
