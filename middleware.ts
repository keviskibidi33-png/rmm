import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  // Protected paths
  const isProtectedPath =
    pathname === "/" ||
    pathname.startsWith("/devices") ||
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/backups") ||
    pathname.startsWith("/automation") ||
    pathname.startsWith("/settings")

  if (isProtectedPath && !token) {
    // Redirect to login page if no token cookie is found
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === "/login" && token) {
    // Redirect authenticated users trying to visit login page back to Dashboard
    const dashboardUrl = new URL("/", request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, backend communicates separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
