import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic auth gate for the account, admin, and manager areas:
 * checks that the relevant portal's session cookie exists before allowing navigation.
 * Full cryptographical & role verification happens server-side via `getSessionUser`/`checkApiRole`
 * in the route's own layout — this is just the early redirect to avoid a flash of protected UI.
 *
 * Cookie names must stay in sync with SESSION_COOKIE in src/lib/auth/cookies.ts — Admin/Manager/
 * Customer each have their own independent cookie, not a single shared NextAuth-style token.
 */
const ADMIN_SESSION_COOKIE = "rmax_admin_session";
const MANAGER_SESSION_COOKIE = "rmax_manager_session";
const CUSTOMER_SESSION_COOKIE = "rmax_customer_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection: unauthenticated users must go to /admin/login
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      // Already signed in (e.g. the user pressed Back after logging in) — bounce forward
      // instead of showing the login form again.
      if (request.cookies.has(ADMIN_SESSION_COOKIE)) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      if (request.cookies.has(MANAGER_SESSION_COOKIE)) {
        return NextResponse.redirect(new URL("/manager/dashboard", request.url));
      }
      return NextResponse.next();
    }
    if (!request.cookies.has(ADMIN_SESSION_COOKIE)) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Manager routes protection: unauthenticated users must go to /admin/login
  if (pathname.startsWith("/manager")) {
    if (!request.cookies.has(MANAGER_SESSION_COOKIE)) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Customer account routes protection: unauthenticated users must go to /login
  if (pathname.startsWith("/account")) {
    if (!request.cookies.has(CUSTOMER_SESSION_COOKIE)) {
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

