import { requireRole } from "@/lib/session";

/**
 * Guards every Admin Portal page except /admin/login (which lives outside this route group).
 * Requires a valid Admin session specifically — a Manager session here is redirected to /403,
 * never silently treated as admin access.
 */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["super_admin", "admin"]);
  return <>{children}</>;
}
