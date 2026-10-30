"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname } from "next/navigation";

/**
 * Intelligent Scroll Restorer:
 * 1. On page refresh (F5 / reload): Keeps the exact scroll position where the user was.
 * 2. On route change / link navigation: Opens the new page cleanly from the very top (0, 0).
 * 3. On hash navigation (e.g. #specs): Smoothly scrolls to the target anchor.
 */
function ScrollRestorer() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  // Continuously record scroll position per route in sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          sessionStorage.setItem(`scroll_${window.location.pathname}`, window.scrollY.toString());
        } catch {}
      }, 60);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isInitialMount = prevPathname.current === null;
    const isRouteChange = !isInitialMount && prevPathname.current !== pathname;
    prevPathname.current = pathname;

    // Reset any modal scroll locks on navigation
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("modal-open");
    }

    // CASE 1: Route Change (user clicked a link to another page) -> OPEN FROM TOP
    if (isRouteChange) {
      if (window.location.hash) {
        const id = window.location.hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      return;
    }

    // CASE 2: Initial Mount / Refresh (F5 / browser reload) -> STAY AT CURRENT SCROLL
    if (isInitialMount) {
      if (window.location.hash) {
        const id = window.location.hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }

      try {
        const savedY = sessionStorage.getItem(`scroll_${pathname}`);
        if (savedY !== null) {
          const y = parseInt(savedY, 10);
          if (!isNaN(y) && y > 0) {
            window.scrollTo({ top: y, left: 0, behavior: "instant" });
            requestAnimationFrame(() => {
              window.scrollTo({ top: y, left: 0, behavior: "instant" });
            });
            setTimeout(() => {
              window.scrollTo({ top: y, left: 0, behavior: "instant" });
            }, 50);
          }
        }
      } catch {}
    }
  }, [pathname]);

  return null;
}

/**
 * Universal Scroll & Modal State Manager
 * - Sets scrollRestoration = "auto" so the browser preserves scroll on refresh.
 * - Manages clean route-change top scrolling and modal scroll unlock.
 */
export function GlobalModalScrollLock() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
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
