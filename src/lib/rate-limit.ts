/**
 * Fixed-window rate limiting.
 *  - rateLimitShared: counters live in MongoDB, so every serverless instance sees the same count. Used for
 *    login, forgot-password, OTP verification and public enquiries.
 *  - rateLimit: per-instance memory. It is the fallback if the database cannot be reached (fail-open to a
 *    local limit rather than blocking customers).
 */
type Entry = { count: number; resetAt: number };

const globalStore = globalThis as unknown as { _rateLimit?: Map<string, Entry> };
const store = (globalStore._rateLimit ??= new Map<string, Entry>());

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  if (store.size > 5000) {
    for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
  }
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  entry.count += 1;
  return { allowed: entry.count <= max, retryAfterMs: entry.resetAt - now };
}

type Shared = { allowed: boolean; retryAfterMs: number };
declare global {
  var __rateLimitIndex: Promise<unknown> | undefined;
}

/** Shared fixed-window counter: one upserted document per key and window, expired by a TTL index. */
export async function rateLimitShared(key: string, max: number, windowMs: number): Promise<Shared> {
  try {
    const { connectDB } = await import("@/lib/mongodb");
    const mongoose = (await connectDB()) as typeof import("mongoose");
    const col = mongoose.connection.collection("ratelimits");
    globalThis.__rateLimitIndex ??= col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => undefined);
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const filter = { _id: `${key}:${windowStart}` as unknown as import("mongodb").ObjectId };
    const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowStart + windowMs + 60_000) } };
    let doc;
    try {
      doc = await col.findOneAndUpdate(filter, update, { upsert: true, returnDocument: "after" });
    } catch (e) {
      if ((e as { code?: number }).code !== 11000) throw e; // two first requests raced to create the window: retry once
      doc = await col.findOneAndUpdate(filter, update, { upsert: true, returnDocument: "after" });
    }
    const count = (doc as unknown as { count?: number } | null)?.count ?? 1;
    return { allowed: count <= max, retryAfterMs: windowStart + windowMs - now };
  } catch {
    return rateLimit(key, max, windowMs);
  }
}
