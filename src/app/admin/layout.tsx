import Link from 'next/link'
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Newspaper, FileText, Image as ImageIcon, BookOpen, Globe, Tag, Users, Settings } from 'lucide-react'

const nav: Array<{ label: string; href: string; icon: any }> = [
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

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side guard: require authenticated admin
  const cookieStore = await cookies()
  // Use supabase SSR client to read the current session reliably
  const supabase = await getServerSupabase()
  const { data: session } = await supabase.auth.getSession()
  const user = session.session?.user
  if (!user) redirect('/auth/login?next=/admin')
  const { data: profile } = await supabaseAdmin.from('users_profiles').select('id, role').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'admin') {
    redirect('/?error=forbidden')
  }
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] bg-gray-50">
      {/* Left sidebar */}
      <aside className="hidden lg:flex flex-col border-r border-gray-200 bg-white p-4">
        <div className="text-xl font-semibold text-gray-900 mb-4">Admin</div>
        <nav className="space-y-1">
          {nav.map(item => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition-colors'
              )}>
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="p-4 lg:p-6">
        {children}
      </main>

      {/* Right sidebar removed by request */}
    </div>
  )
}


