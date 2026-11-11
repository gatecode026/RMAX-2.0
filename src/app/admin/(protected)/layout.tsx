import { requireRole } from "@/lib/session";

/**
 * Every page here reads the session cookie on each request, so it can never be prerendered —
 * opt out explicitly instead of letting Next.js warn about `connection()` outside Suspense.
 */
export const instant = false;

/**
 * Guards every Admin Portal page except /admin/login (which lives outside this route group).
 * Requires a valid Admin session specifically — a Manager session here is redirected to /403,
 * never silently treated as admin access.
 */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["super_admin", "admin"]);
  return <>{children}</>;
}
