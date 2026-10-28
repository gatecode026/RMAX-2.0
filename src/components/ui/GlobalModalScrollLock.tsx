"use client";

import { useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";

function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    // Whenever route changes, always guarantee body and html scroll is unlocked
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("modal-open");
    }
  }, [pathname]);

  return null;
}

/**
 * Universal Modal Scroll Restorer
 * Automatically ensures scrolling is active and unlocked upon route transitions.
 */
export function GlobalModalScrollLock() {
  useEffect(() => {
    // Unlock on initial mount
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("modal-open");
    }
  }, []);

  return (
    <Suspense fallback={null}>
      <ScrollRestorer />
    </Suspense>
  );
}
