import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { UserRole } from "@/lib/enums";

/**
 * Minimal, dependency-free signed session tokens (HMAC-SHA256), used instead of a
 * general-purpose JWT library because each of the three portals (Admin, Manager,
 * Customer) needs its own independent, absolutely-expiring session — see
 * docs/AUTH_ARCHITECTURE.md (implementation report) for the full rationale.
 *
 * Format: base64url(JSON payload) + "." + base64url(HMAC-SHA256 signature)
 */

export type SessionTier = "admin" | "manager" | "customer";

export interface SessionPayload {
  /** User document id (string ObjectId). */
  sub: string;
  /** Actual stored role: super_admin | admin | manager | customer. */
  role: UserRole;
  /** Which portal/cookie this token belongs to — tokens are never valid outside their own tier. */
  tier: SessionTier;
  email: string;
  name: string;
  /** Snapshot of User.tokenVersion at login time — bumping the DB value revokes this token immediately. */
  tv: number;
  /** Absolute session creation time, ms epoch. Never changes for the life of the session. */
  iat: number;
  /** Absolute, non-extendable expiry = iat + 7 days, ms epoch. */
  exp: number;
}

export const ABSOLUTE_SESSION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, hard ceiling

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!s) throw new Error("AUTH_SECRET (or JWT_SECRET) must be set to sign session tokens.");
  return s;
}

function b64url(input: Buffer): string {
  return input.toString("base64url");
}

function sign(data: string): string {
  return b64url(createHmac("sha256", secret()).update(data).digest());
}

export function createSessionToken(input: {
  sub: string;
  role: UserRole;
  tier: SessionTier;
  email: string;
  name: string;
  tv: number;
}): { token: string; payload: SessionPayload } {
  const iat = Date.now();
  const payload: SessionPayload = {
    sub: input.sub,
    role: input.role,
    tier: input.tier,
    email: input.email,
    name: input.name,
    tv: input.tv,
    iat,
    exp: iat + ABSOLUTE_SESSION_MS,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const token = `${body}.${sign(body)}`;
  return { token, payload };
}

/** Verifies signature + absolute expiry only. Caller must separately check tokenVersion against the DB. */
export function verifySessionToken(token: string | undefined | null, expectTier: SessionTier): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let expectedSig: string;
  try {
    expectedSig = sign(body);
  } catch {
    return null;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (payload.tier !== expectTier) return null;
  if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
  return payload;
}
