"use client";

import { useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";

function unlock() {
  if (typeof document === "undefined") return;
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  document.body.classList.remove("modal-open");
}

function RouteChangeListener() {
  const pathname = usePathname();

  useEffect(() => {
    unlock();
  }, [pathname]);

  return null;
}

/**
 * Universal Modal Scroll Lock
 * Safely manages scroll lock when modals are open and guarantees scrolling
 * is restored when modals close or during route transitions.
 */
export function GlobalModalScrollLock() {
  useEffect(() => {
    // Forcibly clear on popstate / browser back & forward
    window.addEventListener("popstate", unlock);

    // Patch history.pushState & replaceState to unlock immediately on client-side routing
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function (...args) {
      unlock();
      return origPush.apply(this, args);
    };

    history.replaceState = function (...args) {
      unlock();
      return origReplace.apply(this, args);
    };

    function checkModals() {
      if (typeof document === "undefined") return;

      // Find modal backdrops or active dialogs in the DOM
      const modalElements = document.querySelectorAll(
        '[role="dialog"], [aria-modal="true"], .fixed.inset-0.z-50, .fixed.inset-0.z-\\[10000\\]'
      );

      let hasActiveModal = false;
      modalElements.forEach((el) => {
        // Exclude elements that are hidden, detached, or invisible
        const style = window.getComputedStyle(el);
        const htmlEl = el as HTMLElement;
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          htmlEl.offsetWidth > 0 &&
          htmlEl.offsetHeight > 0
        ) {
          hasActiveModal = true;
        }
      });

      if (hasActiveModal) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.body.classList.add("modal-open");
      } else {
        unlock();
      }
    }

    // Initial check
    checkModals();

    const observer = new MutationObserver(() => {
      checkModals();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "aria-modal", "role"],
    });

    window.addEventListener("rmax:unlock_scroll", unlock);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", unlock);
      window.removeEventListener("rmax:unlock_scroll", unlock);
      history.pushState = origPush;
      history.replaceState = origReplace;
      unlock();
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <RouteChangeListener />
    </Suspense>
  );
}
