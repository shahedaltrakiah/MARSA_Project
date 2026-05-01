import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_PATHS = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('marsa_token')?.value

  const isAppRoute = pathname.startsWith('/app')
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (isAppRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/app/projects', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/login', '/register'],
}
