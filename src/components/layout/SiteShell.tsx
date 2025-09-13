'use client'

import { PropsWithChildren } from 'react'
import { usePathname } from 'next/navigation'
import { Header, Footer } from '@/components/layout'

export default function SiteShell({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}


