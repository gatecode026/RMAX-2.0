/** Assert-based check of the client polling / shared-stream helpers: `npx tsx scripts/client-check.ts` */
import assert from "node:assert/strict";

// --- minimal browser stubs ---------------------------------------------------------------------------
const docListeners = new Map<string, Set<() => void>>();
const doc = {
  visibilityState: "visible" as "visible" | "hidden",
  addEventListener: (t: string, h: () => void) => (docListeners.get(t) ?? docListeners.set(t, new Set()).get(t)!).add(h),
  removeEventListener: (t: string, h: () => void) => docListeners.get(t)?.delete(h),
};
(globalThis as unknown as { document: unknown }).document = doc;

let opened = 0;
let closed = 0;
class FakeES {
  readyState = 1;
  onopen: ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  constructor() {
    opened++;
  }
  addEventListener() {}
  close() {
    closed++;
  }
}
(globalThis as unknown as { EventSource: unknown }).EventSource = FakeES;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { startPolling } = await import("../src/lib/client/polling");
  const { subscribeStaffStream } = await import("../src/lib/client/staff-stream");

  // visible tab polls on schedule
  let calls = 0;
  let stop = startPolling(async () => void calls++, 20);
  await sleep(110);
  stop();
  assert.ok(calls >= 3 && calls <= 6, `visible calls=${calls}`);

  // hidden tab does not poll
  doc.visibilityState = "hidden";
  calls = 0;
  stop = startPolling(async () => void calls++, 100);
  await sleep(130);
  assert.equal(calls, 0, "no requests while hidden");
  // becoming visible refreshes immediately once an interval has passed
  doc.visibilityState = "visible";
  docListeners.get("visibilitychange")?.forEach((h) => h());
  await sleep(5);
  assert.equal(calls, 1, "refresh on return to the tab");
  stop();
  assert.equal(docListeners.get("visibilitychange")?.size, 0, "listener removed on stop");

  // never overlaps: a slow call suppresses later ticks
  let active = 0;
  let maxActive = 0;
  calls = 0;
  stop = startPolling(async () => {
    calls++;
    active++;
    maxActive = Math.max(maxActive, active);
    await sleep(70);
    active--;
  }, 10);
  await sleep(200);
  stop();
  assert.equal(maxActive, 1, "no overlapping polls");
  assert.ok(calls <= 4, `slow poll calls=${calls}`);

  // stop aborts the in-flight signal
  let aborted = false;
  stop = startPolling(async (signal) => {
    signal.addEventListener("abort", () => (aborted = true));
    await sleep(60);
  }, 10);
  await sleep(30);
  stop();
  assert.equal(aborted, true, "signal aborted on stop");

  // one EventSource for any number of subscribers, closed with the last
  const u1 = subscribeStaffStream({ permissions: () => {} });
  const u2 = subscribeStaffStream({ notification: () => {} });
  assert.equal(opened, 1, "single shared EventSource");
  u1();
  assert.equal(closed, 0, "stays open while a subscriber remains");
  u2();
  assert.equal(closed, 1, "closes with the last subscriber");

  console.log("client-check: all assertions passed");
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
