import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getServerSupabase } from '@/lib/supabase/server-ssr'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side guard: require authenticated admin
  const cookieStore = await cookies()
  // Use supabase SSR client to read the current session reliably
  const supabase = await getServerSupabase()
  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes.user
  if (!user) redirect('/auth/login?next=/admin')
  const { data: profile } = await supabaseAdmin.from('users_profiles').select('id, role').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'admin') {
    redirect('/?error=forbidden')
  }
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" data-admin-page="true">
      {/* Modern Left Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}


