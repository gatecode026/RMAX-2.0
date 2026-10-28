"use client";

import { useEffect } from "react";

/**
 * Universal Modal Scroll Lock
 * Listens for any active modal dialogs (role="dialog", fixed overlay containers, or .modal-open)
 * and strictly prevents background document and body scrolling.
 */
export function GlobalModalScrollLock() {
  useEffect(() => {
    let scrollLocked = false;
    let originalBodyOverflow = "";
    let originalHtmlOverflow = "";

    function checkModals() {
      // Find modal backdrops or active dialogs in the DOM
      const modalElements = document.querySelectorAll(
        '[role="dialog"], [aria-modal="true"], .fixed.inset-0.z-50, .fixed.inset-0.z-\\[10000\\]'
      );

      // Check if any modal element is currently visible / active
      let hasActiveModal = false;
      modalElements.forEach((el) => {
        // Exclude elements that are hidden or non-modal
        const style = window.getComputedStyle(el);
        if (style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0") {
          hasActiveModal = true;
        }
      });

      if (hasActiveModal && !scrollLocked) {
        scrollLocked = true;
        originalBodyOverflow = document.body.style.overflow;
        originalHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.body.classList.add("modal-open");
      } else if (!hasActiveModal && scrollLocked) {
        scrollLocked = false;
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.classList.remove("modal-open");
      }
    }

    // Initial check
    checkModals();

    // Observe DOM mutations to detect modals being opened or closed dynamically
    const observer = new MutationObserver(() => {
      checkModals();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "aria-modal", "role"],
    });

    return () => {
      observer.disconnect();
      if (scrollLocked) {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.classList.remove("modal-open");
      }
    };
  }, []);

  return null;
}
