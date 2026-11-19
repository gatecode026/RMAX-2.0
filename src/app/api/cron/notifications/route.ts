import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { processDue, releaseStaleJobs } from "@/lib/mail/outbox";
import { recoverMissedNotifications } from "@/lib/mail/notify";

export const maxDuration = 60;

function authorised(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // never open: without a secret the endpoint is off
  const given = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

/**
 * GET /api/cron/notifications — the retry / recovery worker. Vercel Cron calls it with
 * `Authorization: Bearer $CRON_SECRET`; any external scheduler can do the same.
 *  1. release jobs whose worker died,  2. enqueue notifications missed for recent records,
 *  3. send everything that is due (retries honour their backoff).
 */
export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const released = await releaseStaleJobs();
  // A failing recovery scan must not stop retries from being sent.
  const recovered = await recoverMissedNotifications().catch((e) => {
    console.error("[mail] recovery sweep failed:", (e as Error)?.name ?? "error");
    return { recovered: 0 };
  });
  const processed = await processDue({ limit: 50 });
  return NextResponse.json({ ok: true, released, ...recovered, ...processed });
}
