"use client";

/**
 * One shared EventSource to /api/notifications/stream per browser tab. Before this, a manager tab opened two
 * (permissions + notifications), each holding a serverless request open. The connection opens with the first
 * subscriber, closes with the last, and reconnects after 6 s if it drops.
 */
type Handler = (event: MessageEvent | Event) => void;

const handlers = new Map<string, Set<Handler>>();
let es: EventSource | null = null;
let retry: ReturnType<typeof setTimeout> | null = null;
let count = 0;

const emit = (type: string, e: MessageEvent | Event) => handlers.get(type)?.forEach((h) => h(e));

function connect() {
  if (typeof EventSource === "undefined" || es) return;
  es = new EventSource("/api/notifications/stream");
  es.onopen = (e) => emit("open", e);
  es.onmessage = (e) => emit("message", e);
  es.addEventListener("notification", (e) => emit("notification", e));
  es.addEventListener("permissions", (e) => emit("permissions", e));
  es.onerror = (e) => {
    emit("error", e);
    es?.close();
    es = null;
    if (count > 0 && !retry) {
      retry = setTimeout(() => {
        retry = null;
        if (count > 0) connect();
      }, 6000);
    }
  };
}

/** Subscribe to stream events ("open" | "error" | "message" | "notification" | "permissions"). Returns unsubscribe. */
export function subscribeStaffStream(map: Partial<Record<"open" | "error" | "message" | "notification" | "permissions", Handler>>): () => void {
  count++;
  for (const [type, h] of Object.entries(map)) {
    if (!h) continue;
    if (!handlers.has(type)) handlers.set(type, new Set());
    handlers.get(type)!.add(h);
  }
  connect();
  // a late subscriber should still learn the stream is already open
  if (es?.readyState === 1) map.open?.(new Event("open"));
  return () => {
    for (const [type, h] of Object.entries(map)) if (h) handlers.get(type)?.delete(h);
    if (--count <= 0) {
      count = 0;
      if (retry) clearTimeout(retry);
      retry = null;
      es?.close();
      es = null;
    }
  };
}
