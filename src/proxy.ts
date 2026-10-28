import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic auth gate for the account, admin, and manager areas:
 * checks that an auth session cookie exists before allowing navigation.
 * Full cryptographical & role verification happens server-side via `auth()` and `requireRole()`.
 */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));

  // Admin routes protection: unauthenticated users must go to /admin/login
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    if (!hasSession) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Manager routes protection: unauthenticated users must go to /admin/login
  if (pathname.startsWith("/manager")) {
    if (!hasSession) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Customer account routes protection: unauthenticated users must go to /login
  if (pathname.startsWith("/account")) {
    if (!hasSession) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/manager/:path*"],
};

