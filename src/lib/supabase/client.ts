import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      // Suppress refresh token errors in console (they're expected when session expires)
      fetch: async (url, options) => {
        const response = await fetch(url, options)
        // Don't log expected auth errors
        const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url instanceof Request ? url.url : ''
        if (!response.ok && urlString.includes('/token?grant_type=refresh_token')) {
          // Silently handle refresh token errors - this is expected behavior
          return response
        }
        return response
      }
    }
  }
)


