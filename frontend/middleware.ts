import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

function pathnameWithoutLocale(pathname: string): string {
  for (const loc of routing.locales) {
    if (pathname === `/${loc}`) return "/"
    if (pathname.startsWith(`/${loc}/`)) {
      return pathname.slice(`/${loc}`.length) || "/"
    }
  }
  return pathname
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("marsa_token")?.value

  if (pathname.startsWith('/admin')) {
    // Allow the admin login page through unconditionally
    if (pathname === '/admin/login') {
      if (token) {
        const raw = request.cookies.get('marsa_user')?.value
        const user = raw ? JSON.parse(raw) : null
        if (['admin', 'super_admin'].includes(user?.role ?? '')) {
          return NextResponse.redirect(new URL('/admin/users', request.url))
        }
      }
      return NextResponse.next()
    }

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const raw = request.cookies.get('marsa_user')?.value
    const user = raw ? JSON.parse(raw) : null
    const role = user?.role ?? 'user'
    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/app")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  const basePath = pathnameWithoutLocale(pathname)
  const isAuthRoute = ["/login", "/register", "/forgot-password"].includes(basePath)

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
