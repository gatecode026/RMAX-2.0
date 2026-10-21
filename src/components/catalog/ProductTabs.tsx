"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type TabItem = { label: string; id?: string; href?: string };

/** Sticky section tabs with scroll-spy. Items with `id` jump to a section; items with `href` open another page. */
export function ProductTabs({ items }: { items: TabItem[] }) {
  const [active, setActive] = useState(items.find((i) => i.id)?.id ?? "");

  useEffect(() => {
    const els = items.flatMap((i) => (i.id ? [document.getElementById(i.id)] : [])).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  const base = "relative whitespace-nowrap px-1 py-4 text-body-sm transition";
  return (
    <nav aria-label="Product sections" className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
      <ul className="mx-auto flex w-full max-w-(--container-home) gap-6 overflow-x-auto px-5 sm:px-8 md:gap-[34px] xl:px-0">
        {items.map((i) => (
          <li key={i.label}>
            {i.id ? (
              <a
                href={`#${i.id}`}
                aria-current={active === i.id ? "true" : undefined}
                className={cn(base, active === i.id ? "font-bold text-navy after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-navy" : "text-muted hover:text-navy")}
              >
                {i.label}
              </a>
            ) : (
              <Link href={i.href ?? "#"} className={cn(base, "text-muted hover:text-navy")}>
                {i.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
