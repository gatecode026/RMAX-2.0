import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_TTL_MS = 10 * 60_000;
export const OTP_RESEND_COOLDOWN_MS = 60_000;
export const OTP_MAX_ATTEMPTS = 5;

function secret() {
  const s = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

/** 6-digit code from a CSPRNG. */
export const generateOtp = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

/** HMAC bound to the account, so a code cannot be replayed against another user. */
export const hashOtp = (userId: string, code: string) => createHmac("sha256", secret()).update(`${userId}:${code}`).digest("hex");

export function otpMatches(userId: string, code: string, storedHash: string) {
  const a = Buffer.from(hashOtp(userId, code), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
