import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { isDatabaseUnavailable } from "@/lib/mongodb";

export type ApiResult<T> = { success: true; data: T; error: null } | { success: false; data: null; error: ApiError };
export type ApiError = { message: string; fields?: Record<string, string> };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResult<T>>({ success: true, data, error: null }, { status });
}

export function fail(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json<ApiResult<never>>(
    { success: false, data: null, error: { message, ...(fields ? { fields } : {}) } },
    { status },
  );
}

export function zodFail(err: ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fail("Please check the highlighted fields.", 422, fields);
}

export const DB_UNAVAILABLE_MESSAGE =
  "The database is not connected right now, so this feature is unavailable. Please try again later.";

/** Wrap a route handler: connection failures become a clean 503, anything else a generic 500. */
export function route<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (isDatabaseUnavailable(err)) return fail(DB_UNAVAILABLE_MESSAGE, 503);
      console.error(err);
      // Surface the cause in development only; production never leaks internals.
      const detail = process.env.NODE_ENV !== "production" && err instanceof Error ? ` (${err.name}: ${err.message})` : "";
      return fail(`Something went wrong. Please try again.${detail}`, 500);
    }
  };
}

export function isDuplicateKey(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Returns a 429 response when the caller is over the limit, otherwise null. */
export function limited(req: Request, bucket: string, max: number, windowMs: number) {
  const res = rateLimit(`${bucket}:${clientIp(req)}`, max, windowMs);
  if (res.allowed) return null;
  const r = fail("Too many requests. Please try again shortly.", 429);
  r.headers.set("Retry-After", String(Math.ceil(res.retryAfterMs / 1000)));
  return r;
}

/** Parse + validate a JSON body. Returns either the parsed data or an error response. */
export async function readJson(req: Request): Promise<{ body: unknown } | { response: NextResponse }> {
  try {
    return { body: await req.json() };
  } catch {
    return { response: fail("Invalid JSON body.", 400) };
  }
}
