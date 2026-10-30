import "server-only";
import { ok, fail } from "@/lib/api";
import { getTierSession, destroySession } from "@/lib/session";
import type { SessionTier } from "@/lib/auth/tokens";

const PORTAL_LABEL: Record<SessionTier, string> = {
  admin: "Admin",
  manager: "Manager",
  customer: "Customer",
};

/** GET /api/auth/{tier}/session — current identity for exactly this portal, or null. */
export async function sessionStatusHandler(tier: SessionTier) {
  const user = await getTierSession(tier);
  if (!user) return ok({ authenticated: false, user: null });
  return ok({
    authenticated: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

/** POST /api/auth/{tier}/logout — invalidates only this portal's session cookie. */
export async function logoutHandler(tier: SessionTier) {
  await destroySession(tier);
  return ok({ loggedOut: true });
}

/**
 * POST /api/auth/{tier}/refresh — intentionally a no-op that always rejects. The 7-day
 * absolute session lifetime is fixed at login and must never be extended by activity or by
 * calling refresh; once a session expires the only way back in is a fresh login.
 */
export function refreshRejectedHandler(tier: SessionTier) {
  return fail(
    `${PORTAL_LABEL[tier]} sessions are fixed at 7 days from login and cannot be refreshed or extended. Please sign in again once your session expires.`,
    410,
  );
}
