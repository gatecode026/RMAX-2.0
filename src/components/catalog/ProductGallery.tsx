"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/cn";
import type { IGalleryItem } from "@/models/Product";

/** Thumbnail rail + large viewer. Thumbnails stack vertically on desktop and scroll sideways on mobile. */
export function ProductGallery({ items, title }: { items: IGalleryItem[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];
  if (!current) return null;

  return (
    <div className="flex min-w-0 flex-col-reverse gap-4 sm:flex-row sm:gap-[15px]" aria-label={`${title} gallery`} role="group">
      {items.length > 1 && (
        <ul className="flex shrink-0 gap-3 overflow-x-auto pb-1 sm:w-[72px] sm:flex-col sm:gap-[15px] sm:overflow-visible sm:pb-0">
          {items.map((g, i) => (
            <li key={g.thumb} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={g.kind === "video" ? `Play video: ${g.alt}` : `Show image ${i + 1}: ${g.alt}`}
                aria-current={i === active}
                className={cn(
                  "relative block h-[95px] w-[72px] overflow-hidden rounded-[14px] border-2 bg-soft transition",
                  i === active ? "border-navy" : "border-transparent hover:border-line",
                )}
              >
                <Image src={g.thumb} alt="" width={66} height={89} className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative aspect-[461/543] w-full overflow-hidden rounded-[24px] bg-soft sm:w-[461px] sm:max-w-full">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={461}
          height={543}
          priority={active === 0}
          className="size-full object-cover"
        />
        {current.kind === "video" && (
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-card/90 text-navy shadow-card">
              <Play className="size-6 fill-current" />
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
