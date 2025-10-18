import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/api/auth",
    "/features",
    "/pricing",
    "/contact",
    "/about",
    "/privacy",
    "/terms",
    "/_next",
    "/favicon.ico",
    "/api/health",
  ];

  // Admin routes that require admin role
  const adminRoutes = ["/admin", "/api/admin"];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    // Redirect to signin for protected routes
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // For API routes, add basic headers (auth validation happens in API routes)
  if (pathname.startsWith("/api/")) {
    const requestHeaders = new Headers(request.headers);

    // Set a flag that session exists (actual validation in API routes)
    requestHeaders.set("x-has-session", "true");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For admin routes, redirect if no session (detailed auth check in API)
  if (isAdminRoute && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - file extensions (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
