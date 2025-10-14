import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/signin", "/signup", "/api/auth", "/features", "/pricing", "/contact"]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check for session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token")

  if (!sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = "/signin"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/api/") && sessionCookie) {
    const requestHeaders = new Headers(request.headers)
    // In production, decode the session token to get the actual user ID
    requestHeaders.set("x-user-id", "mock-user-id")

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
