'use client'

import { supabase } from '@/lib/supabase/client'

export async function logoutAndRedirect(redirectTo: string = '/') {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    try { controller.abort() } catch {}
  }, 1500)
  try {
    await Promise.allSettled([
      fetch('/api/auth/signout', { method: 'POST', cache: 'no-store', keepalive: true, signal: controller.signal }),
      supabase.auth.signOut(),
    ])
  } catch {}
  clearTimeout(timer)
  try {
    window.location.replace(redirectTo)
  } catch {
    window.location.href = redirectTo
  }
}


