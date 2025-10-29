import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      
      // Get the user to check if they have a business
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user owns a business using supabase query directly
        try {
          const { data: businessData } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', user.id)
            .single()
          
          if (businessData) {
            return NextResponse.redirect(new URL('/business', requestUrl.origin))
          }
        } catch (error) {
          console.error('Error checking business:', error)
        }
      }
      
      // Default redirect to profile
      return NextResponse.redirect(new URL('/profile', requestUrl.origin))
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/auth/login?error=auth_callback_error', requestUrl.origin))
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}

