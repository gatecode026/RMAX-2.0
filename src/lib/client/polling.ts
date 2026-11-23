/**
 * Visibility-aware polling for staff dashboards.
 *  - runs `fn` every `ms`, but only while the tab is visible (no background-tab traffic);
 *  - never overlaps: a tick is skipped while the previous call is still running;
 *  - when the tab becomes visible again it refreshes at once if a full interval has passed;
 *  - the `AbortSignal` passed to `fn` is aborted on `stop()` so an unmounted page drops its response.
 * Returns `stop`. It does not run `fn` immediately: callers load their initial data themselves.
 */
export function startPolling(fn: (signal: AbortSignal) => Promise<unknown>, ms: number): () => void {
  const ctrl = new AbortController();
  let running = false;
  let last = Date.now();

  const tick = async () => {
    if (running || ctrl.signal.aborted) return;
    running = true;
    try {
      await fn(ctrl.signal);
    } catch {
      /* the caller handles its own errors; polling must never throw */
    } finally {
      running = false;
      last = Date.now();
    }
  };
  const visible = () => typeof document === "undefined" || document.visibilityState !== "hidden";

  const timer = setInterval(() => {
    if (visible()) void tick();
  }, ms);
  const onVisible = () => {
    if (visible() && Date.now() - last >= ms) void tick();
  };
  if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisible);

  return () => {
    ctrl.abort();
    clearInterval(timer);
    if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisible);
  };
}
