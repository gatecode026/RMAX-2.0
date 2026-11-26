import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac } from "node:crypto";

/**
 * Order references (RMAX-00013) are never put in a URL as plain text: links carry an AES-256-GCM token instead
 * (/account/orders/Xk3…). The IV is derived from the reference, so one order always has one URL. The token is
 * only a hiding layer — who may open an order is still decided by the ownership check on every request.
 */
const key = () => {
  const s = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!s) throw new Error("AUTH_SECRET (or JWT_SECRET) must be set.");
  return createHash("sha256").update(`order-ref:${s}`).digest();
};

export function encodeOrderRef(reference: string): string {
  const iv = createHmac("sha256", key()).update(reference).digest().subarray(0, 12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([c.update(reference, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64url");
}

/** The reference inside a token, or null when it is not one of ours (tampered, other secret, plain text). */
export function decodeOrderRef(token: string): string | null {
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 29) return null;
    const d = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString("utf8");
  } catch {
    return null;
  }
}
