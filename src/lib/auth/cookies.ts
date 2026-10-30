import "server-only";
import { cookies } from "next/headers";
import type { SessionTier } from "@/lib/auth/tokens";
import { ABSOLUTE_SESSION_MS } from "@/lib/auth/tokens";

/**
 * Three fully independent session cookies — one per portal. Using distinct names (rather
 * than one shared cookie) is what makes Admin, Manager and Customer sessions coexist in the
 * same browser without overwriting one another, and lets each be logged out independently.
 */
export const SESSION_COOKIE: Record<SessionTier, string> = {
  admin: "rmax_admin_session",
  manager: "rmax_manager_session",
  customer: "rmax_customer_session",
};

const MAX_AGE_SECONDS = Math.floor(ABSOLUTE_SESSION_MS / 1000); // 7 days — cookie dies exactly when the token would anyway

export async function getSessionCookie(tier: SessionTier): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE[tier])?.value;
}

export async function setSessionCookie(tier: SessionTier, token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE[tier], token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(tier: SessionTier): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE[tier], "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
