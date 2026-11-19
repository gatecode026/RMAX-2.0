"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { canAccessPath, firstAllowedHref, type ManagerPermissions } from "@/lib/permissions";

const PermissionsContext = createContext<ManagerPermissions | null>(null);

/** Current manager's permissions (kept fresh by the provider). Must be used under ManagerPermissionsProvider. */
export function useManagerPermissions(): ManagerPermissions {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("useManagerPermissions must be used inside ManagerPermissionsProvider");
  return ctx;
}

const POLL_MS = 30_000;

/**
 * Holds the manager's permissions and keeps them current without a manual refresh:
 *  - instant: the notifications SSE stream pushes a "permissions" event when an admin saves;
 *  - fallback: re-read every 30s and whenever the tab regains focus (covers a dropped stream or
 *    a multi-instance deployment where the in-process event never reaches this server).
 * If the page being viewed is no longer allowed, the manager is moved to their first allowed page.
 */
export function ManagerPermissionsProvider({ initial, children }: { initial: ManagerPermissions; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [permissions, setPermissions] = useState(initial);
  const last = useRef(JSON.stringify(initial));

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/manager/permissions", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      const next = json.permissions as ManagerPermissions | undefined;
      if (!next) return;
      const key = JSON.stringify(next);
      if (key !== last.current) {
        last.current = key;
        setPermissions(next);
        router.refresh(); // re-run server layouts/guards for the page that is open
      }
    } catch {
      // Offline or signed out: keep what we have; the server enforces on every request anyway.
    }
  }, [router]);

  useEffect(() => {
    const es = typeof EventSource !== "undefined" ? new EventSource("/api/notifications/stream") : null;
    es?.addEventListener("permissions", () => void refresh());
    const interval = setInterval(refresh, POLL_MS);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      es?.close();
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  useEffect(() => {
    if (!canAccessPath(permissions, pathname)) router.replace(firstAllowedHref(permissions));
  }, [permissions, pathname, router]);

  const value = useMemo(() => permissions, [permissions]);
  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}
