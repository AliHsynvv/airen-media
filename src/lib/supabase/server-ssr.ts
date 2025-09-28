import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getServerSupabase() {
  const cookieStore = await cookies()
  const isProd = process.env.NODE_ENV === 'production'
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined
  const cookieSameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase() as 'lax' | 'strict' | 'none'
  const defaultMaxAge = Number.isFinite(Number(process.env.COOKIE_MAX_AGE)) ? Number(process.env.COOKIE_MAX_AGE) : 60 * 60 * 24 * 30
  const secureEnv = process.env.COOKIE_SECURE
  const secure = typeof secureEnv === 'string' ? secureEnv === 'true' : isProd
  const hardenedDefaults: Partial<CookieOptions> = {
    httpOnly: true,
    secure,
    sameSite: cookieSameSite,
    path: '/',
    domain: cookieDomain,
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Next.js 15: Cookie mutations only allowed in Server Actions or Route Handlers
            cookieStore.set({
              name,
              value,
              ...hardenedDefaults,
              ...options,
              // ensure a persistent session unless explicitly overridden
              maxAge: options?.maxAge ?? defaultMaxAge,
            })
          } catch {
            // Silently ignore when used in Server Components to avoid runtime error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...hardenedDefaults,
              ...options,
              maxAge: 0,
            })
          } catch {
            // ignore if not allowed in this context
          }
        },
      },
    }
  )
  return supabase
}


