import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import type { UserRole } from "@/lib/enums";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  status?: string;
}

/** Verified user id from the Auth.js session, or null for guests. */
export async function getSessionUserId(): Promise<string | null> {
  await connection(); // session validation reads the clock → request-time only
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Verified full session user, or null if unauthenticated. */
export async function getSessionUser(): Promise<SessionUser | null> {
  await connection();
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role || "customer",
    status: session.user.status,
  };
}

/** For account pages: redirect to /login when not signed in. */
export async function requireUserId(next?: string): Promise<string> {
  const id = await getSessionUserId();
  if (!id) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return id;
}

/**
 * Server Component guard: require specific roles.
 * E.g., requireRole(["super_admin"]) or requireRole(["manager", "super_admin"]).
 */
export async function requireRole(allowedRoles: UserRole[], next?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(next ? `/admin/login?next=${encodeURIComponent(next)}` : "/admin/login");
  }

  // Treat "admin" as "super_admin" for backwards compatibility
  const userRole = user.role === "admin" ? "super_admin" : user.role;
  const isAllowed = allowedRoles.some((r) => r === userRole || (r === "super_admin" && user.role === "admin"));

  if (!isAllowed) {
    if (user.role === "manager") {
      redirect("/manager/dashboard");
    } else if (user.role === "super_admin" || user.role === "admin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/account");
    }
  }

  return user;
}

/**
 * API Route guard: verifies role from session, returns user or null with error message.
 */
export async function checkApiRole(allowedRoles: UserRole[]): Promise<{ user: SessionUser } | { error: string; status: number }> {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Authentication required", status: 401 };
  }

  const role = session.user.role === "admin" ? "super_admin" : session.user.role || "customer";
  const isAllowed = allowedRoles.some((r) => r === role || (r === "super_admin" && session.user.role === "admin"));

  if (!isAllowed) {
    return { error: "Forbidden: insufficient permissions for this resource", status: 403 };
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      status: session.user.status,
    },
  };
}

