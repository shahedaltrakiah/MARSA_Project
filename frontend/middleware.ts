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
    return NextResponse.redirect(new URL("/app/projects", request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
