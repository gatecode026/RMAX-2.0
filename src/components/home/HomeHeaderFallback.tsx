"use client";

import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { HomeHeaderView, HEADER_CACHE_KEY, type HomeHeaderProps } from "./HomeHeaderView";

const subscribe = () => () => {};
function readCache(): string | null {
  try {
    return sessionStorage.getItem(HEADER_CACHE_KEY);
  } catch {
    return null; // storage blocked
  }
}

/**
 * Shown while the header's session lookup is pending. On a client-side page switch it renders the header exactly as
 * it was on the previous page (kept in sessionStorage by HomeHeaderView), so nothing flashes. On first load and
 * whenever nothing is cached it renders the plain `shell`. The server snapshot is null, so hydration always matches.
 * The real header replaces this as soon as the session resolves, so this never outlives a page switch.
 */
export function HomeHeaderFallback({ shell }: { shell: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readCache, () => null);
  const cached = useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as HomeHeaderProps;
    } catch {
      return null;
    }
  }, [raw]);
  return cached ? <HomeHeaderView {...cached} /> : <>{shell}</>;
}
