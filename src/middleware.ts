import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const host = req.headers.get('host') || ''

  // Skip API routes entirely
  if (url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // If subdomain is admin.*, route to /admin
  if (host.startsWith('admin.')) {
    // Keep the path if already under /admin
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico|api).*)'],
}


