import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { UserRole } from "@/lib/enums";
import { getSessionCookie, setSessionCookie, clearSessionCookie } from "@/lib/auth/cookies";
import { verifySessionToken, createSessionToken, type SessionTier } from "@/lib/auth/tokens";
import type { ResolvedAccount } from "@/lib/auth/resolve";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  status?: string;
}

/** Admin + Super Admin share the `rmax_admin_session` cookie; Manager has its own. */
export function roleToTier(role: UserRole): SessionTier {
  if (role === "manager") return "manager";
  if (role === "customer") return "customer";
  return "admin"; // admin | super_admin
}

/** Issues a brand-new, independent session for the given account and sets its cookie. */
export async function createSession(account: ResolvedAccount): Promise<SessionUser> {
  const tier = roleToTier(account.role);
  const { token } = createSessionToken({
    sub: account.id,
    role: account.role,
    tier,
    email: account.email,
    name: account.name,
    tv: account.tokenVersion,
  });
  await setSessionCookie(tier, token);
  return { id: account.id, name: account.name, email: account.email, role: account.role, status: "active" };
}

/**
 * Clears only the named portal's session cookie AND bumps the account's tokenVersion so the
 * token itself is invalidated server-side immediately — not just removed from the browser.
 * Without this, a captured/replayed copy of the token would remain valid until its natural
 * 7-day expiry even after "logout". The other two independent portal sessions are untouched.
 */
export async function destroySession(tier: SessionTier): Promise<void> {
  const current = await readSession(tier);
  await clearSessionCookie(tier);
  if (current) {
    await connectDB();
    await User.updateOne({ _id: current.id }, { $inc: { tokenVersion: 1 } });
  }
}

// Per-request memoized DB lookup so multiple session checks in one render don't multiply queries.
const loadAccountById = cache(async (id: string) => {
  await connectDB();
  return User.findById(id).select("name email role status tokenVersion").lean();
});

/** Verifies the given tier's cookie: signature, absolute expiry, and live tokenVersion/status. */
async function readSession(tier: SessionTier): Promise<SessionUser | null> {
  const raw = await getSessionCookie(tier);
  const payload = verifySessionToken(raw, tier);
  if (!payload) return null;

  let account;
  try {
    account = await loadAccountById(payload.sub);
  } catch {
    // DB unavailable: fail closed for protected content rather than trusting a stale token.
    return null;
  }
  if (!account) return null;
  if (account.status === "inactive") return null;
  if ((account.tokenVersion ?? 0) !== payload.tv) return null; // revoked (password changed / force-logout)
  if (account.role !== payload.role) return null; // role changed since login — require re-auth

  return { id: payload.sub, name: account.name, email: account.email, role: account.role, status: account.status };
}

/** Reads the Admin session if present and valid, else the Manager session. */
async function readStaffSession(): Promise<SessionUser | null> {
  return (await readSession("admin")) ?? (await readSession("manager"));
}

export type SessionScope = "customer" | "staff";

/** Verified user id from the given portal's session, or null for guests. */
export async function getSessionUserId(scope: SessionScope = "customer"): Promise<string | null> {
  await connection(); // session validation reads the clock → request-time only
  const user = await getSessionUser(scope);
  return user?.id ?? null;
}

/** Verified full session user for the given portal, or null if unauthenticated there. */
export async function getSessionUser(scope: SessionScope = "customer"): Promise<SessionUser | null> {
  await connection();
  if (scope === "customer") return readSession("customer");
  return readStaffSession();
}

/** Convenience: Admin-or-Manager session (whichever is present), for shared staff API routes. */
export async function getStaffSessionUser(): Promise<SessionUser | null> {
  await connection();
  return readStaffSession();
}

/** Reads exactly one portal's session cookie — no fallback to either of the other two. */
export async function getTierSession(tier: SessionTier): Promise<SessionUser | null> {
  await connection();
  return readSession(tier);
}

/**
 * For customer account pages: redirect to /login when no Customer session exists.
 * An active Admin or Manager session never substitutes for Customer authentication — the
 * visitor sees the ordinary guest/login experience, exactly as if nobody were logged in.
 */
export async function requireUserId(next?: string): Promise<string> {
  await connection();
  const user = await readSession("customer");
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return user.id;
}

/**
 * Server Component guard for Admin and/or Manager pages. Each portal requires its OWN
 * session — an Admin session does not grant Manager pages, and vice versa, even though both
 * may be logged in simultaneously in the same browser.
 */
export async function requireRole(allowedRoles: UserRole[], next?: string): Promise<SessionUser> {
  await connection();
  const wantsAdmin = allowedRoles.some((r) => r === "admin" || r === "super_admin");
  const wantsManager = allowedRoles.includes("manager");

  const adminUser = wantsAdmin ? await readSession("admin") : null;
  const managerUser = wantsManager ? await readSession("manager") : null;
  const user = adminUser ?? managerUser;

  if (user) {
    const normalizedRole = user.role === "admin" ? "super_admin" : user.role;
    const isAllowed = allowedRoles.some((r) => r === user.role || (r === "super_admin" && normalizedRole === "super_admin"));
    if (isAllowed) return user;
    // Authenticated, but as the wrong portal identity for this page.
    redirect("/403");
  }

  // No relevant session at all.
  redirect(next ? `/admin/login?next=${encodeURIComponent(next)}` : "/admin/login");
}

/**
 * API Route guard: verifies the caller holds a valid session for one of the allowed roles.
 * Checks the Admin and/or Manager cookie depending on which roles are allowed, and the
 * Customer cookie when "customer" is allowed — never accepts one portal's session for another.
 */
export async function checkApiRole(
  allowedRoles: UserRole[],
): Promise<{ user: SessionUser } | { error: string; status: number }> {
  await connection();

  const [adminUser, managerUser, customerUser] = await Promise.all([
    readSession("admin"),
    readSession("manager"),
    readSession("customer"),
  ]);

  const isAllowedUser = (u: SessionUser | null) =>
    u ? allowedRoles.some((r) => r === u.role || (r === "super_admin" && u.role === "admin")) : false;

  const match = [adminUser, managerUser, customerUser].find(isAllowedUser);
  if (match) return { user: match };

  // Authenticated as *some* identity, just not one permitted for this endpoint → 403.
  if (adminUser || managerUser || customerUser) {
    return { error: "Forbidden: insufficient permissions for this resource", status: 403 };
  }
  // No valid session at all (missing, malformed, expired or revoked) → 401.
  return { error: "Authentication required", status: 401 };
}
