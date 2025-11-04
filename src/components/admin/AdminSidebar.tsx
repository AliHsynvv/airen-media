'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Globe,
  Tag,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Haberler', href: '/admin/news', icon: Newspaper },
  // { label: 'Makaleler', href: '/admin/articles', icon: FileText },
  // { label: 'Medya', href: '/admin/media', icon: ImageIcon },
  { label: 'Hikayeler', href: '/admin/stories', icon: BookOpen },
  { label: 'Ülkeler', href: '/admin/countries', icon: Globe },
  { label: 'Kategoriler', href: '/admin/categories', icon: Tag },
  { label: 'Kullanıcılar', href: '/admin/users', icon: Users },
  { label: 'Ayarlar', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname?.startsWith(href)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/auth/login'
  }

  const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className={cn("flex items-center gap-2.5", isCollapsed && "justify-center")}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-base font-bold text-white">Admin</h1>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl font-medium transition-all duration-200',
                'hover:bg-gray-700/50 hover:shadow-lg hover:shadow-black/20',
                isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                active
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-300 hover:text-white'
              )}
            >
              {/* Active indicator */}
              {active && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-500 rounded-r-full shadow-lg shadow-blue-500/50" />
              )}

              {/* Icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
                  active
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/40'
                    : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-200'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Label */}
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>

                  {/* Arrow indicator on hover */}
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-all duration-200',
                      active
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
                    )}
                  />
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Çıkış Yap' : undefined}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl font-medium text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group",
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
          )}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-700/50 text-gray-400 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all duration-200">
            <LogOut className="h-4 w-4" />
          </div>
          {!isCollapsed && <span className="flex-1 text-left">Çıkış Yap</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all duration-200"
      >
        <Menu className="h-6 w-6 text-gray-300" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 h-screen w-72 z-50 flex flex-col border-r border-gray-700/50 bg-gradient-to-b from-gray-800 to-gray-900 backdrop-blur-xl transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>

        <SidebarContent isCollapsed={false} />
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 border-r border-gray-700/50 bg-gradient-to-b from-gray-800 to-gray-900 backdrop-blur-xl transition-all duration-300",
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shadow-md hover:shadow-lg hover:bg-blue-600 hover:border-blue-500 transition-all duration-200 group"
        >
          {collapsed ? (
            <PanelLeft className="h-3.5 w-3.5 text-gray-400 group-hover:text-white" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5 text-gray-400 group-hover:text-white" />
          )}
        </button>

        <SidebarContent isCollapsed={collapsed} />
      </aside>
    </>
  )
}

