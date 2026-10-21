/**
 * Minimal in-memory fixed-window rate limiter for public POST routes.
 * NOTE: state is per server instance. On multi-instance / serverless deployments
 * swap this for a shared store (Redis, Upstash, …) behind the same signature.
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
