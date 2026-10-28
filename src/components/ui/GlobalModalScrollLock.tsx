"use client";

import { useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";

function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If navigating to a section with a hash anchor (e.g. #faq, #specs)
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Instantly scroll new page to the very top (0, 0)
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Double-check on the next animation frame and after hydration
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);

    // Ensure scroll lock is cleanly removed on any route change
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("modal-open");
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}

/**
 * Universal Scroll & Modal State Manager
 * Ensures all new pages open from the very top (0, 0) and body scroll is active.
 */
export function GlobalModalScrollLock() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Prevent browser from restoring stale scroll coordinates on page transitions
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

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
