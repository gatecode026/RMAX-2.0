"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

const R = 25; // ring radius (button is 52px, 2px stroke sits on the edge)
const C = 2 * Math.PI * R;

/** Floating "jump to top" button: the navy ring fills with page scroll progress; it springs in/out and bounces its arrow on hover. */
export function ScrollToTop() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // Staff consoles have their own chrome.
  if (pathname.startsWith("/admin") || pathname.startsWith("/manager")) return null;

  const visible = progress > 0.04;

  return (
    <button
      type="button"
      aria-label="Jump to top"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`group fixed bottom-6 right-6 z-40 grid size-13 place-items-center rounded-full bg-card shadow-card transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-95 motion-reduce:transition-none ${
        visible ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-6 scale-50 opacity-0"
      }`}
    >
      <svg aria-hidden viewBox="0 0 52 52" className="absolute inset-0 size-full -rotate-90">
        <circle cx="26" cy="26" r={R} fill="none" strokeWidth="2" className="stroke-line" />
        <circle
          cx="26"
          cy="26"
          r={R}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-navy"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
        />
      </svg>
      <ArrowUp aria-hidden className="relative size-5 text-navy group-hover:animate-[jump-bounce_0.7s_ease-in-out_infinite] motion-reduce:animate-none" />
    </button>
  );
}
