"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { Play, ZoomIn } from "lucide-react";
import { cn } from "@/lib/cn";
import type { IGalleryItem } from "@/models/Product";

/** Thumbnail rail + large viewer with Amazon-style lens indicator and zoom flyout. */
export function ProductGallery({ items, title }: { items: IGalleryItem[]; title: string }) {
  const [active, setActive] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewerSize, setViewerSize] = useState({ width: 461, height: 543 });
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState({ width: 184, height: 217 });
  const [zoomRatio, setZoomRatio] = useState({ x: 0.5, y: 0.5 });

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width || 461;
      const h = rect.height || 543;
      setViewerSize({ width: w, height: h });
      const lw = Math.round(w * 0.4);
      const lh = Math.round(h * 0.4);
      setLensSize({ width: lw, height: lh });
    }
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  const current = items[active] ?? items[0];
  if (!current) return null;

  const isVideo = current.kind === "video";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVideo || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const lw = lensSize.width;
    const lh = lensSize.height;
    const cw = rect.width;
    const ch = rect.height;

    let lx = mouseX - lw / 2;
    let ly = mouseY - lh / 2;

    lx = Math.max(0, Math.min(cw - lw, lx));
    ly = Math.max(0, Math.min(ch - lh, ly));

    setLensPos({ x: lx, y: ly });

    const maxLx = cw - lw || 1;
    const maxLy = ch - lh || 1;
    setZoomRatio({
      x: Math.max(0, Math.min(1, lx / maxLx)),
      y: Math.max(0, Math.min(1, ly / maxLy)),
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVideo) return;
    updateSize();
    handleMouseMove(e);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div className="relative flex min-w-0 flex-col-reverse gap-4 sm:flex-row sm:gap-[15px]" aria-label={`${title} gallery`} role="group">
      {items.length > 1 && (
        <ul className="flex shrink-0 gap-3 overflow-x-auto pb-1 sm:w-[72px] sm:flex-col sm:gap-[15px] sm:overflow-visible sm:pb-0">
          {items.map((g, i) => {
            const isCurrent = i === active;
            return (
              <li key={g.thumb} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setIsHovering(false);
                  }}
                  aria-label={g.kind === "video" ? `Play video: ${g.alt}` : `Show image ${i + 1}: ${g.alt}`}
                  aria-current={isCurrent}
                  className={cn(
                    "relative block h-[95px] w-[72px] overflow-hidden rounded-[14px] border-2 bg-soft transition",
                    isCurrent ? "border-navy shadow-xs" : "border-transparent hover:border-line",
                  )}
                >
                  <Image src={g.thumb} alt="" width={66} height={89} className="size-full object-cover" />
                  {/* Small thumbnail active zoom indicator: highlights the exact portion being zoomed */}
                  {isCurrent && isHovering && !isVideo && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute border-2 border-navy bg-navy/30 rounded-[3px] shadow-xs transition-all duration-75"
                      style={{
                        width: "40%",
                        height: "40%",
                        left: `${zoomRatio.x * 60}%`,
                        top: `${zoomRatio.y * 60}%`,
                      }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Main image viewer with Amazon lens box */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative aspect-[461/543] w-full overflow-hidden rounded-[24px] bg-soft sm:w-[461px] sm:max-w-full select-none",
          !isVideo && "cursor-crosshair",
        )}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={922}
          height={1086}
          priority={active === 0}
          className="size-full object-cover pointer-events-none"
        />

        {/* Amazon Lens Box: highlights exactly which part is being magnified */}
        {isHovering && !isVideo && (
          <div
            aria-hidden
            className="pointer-events-none absolute border-2 border-navy/70 bg-navy/20 backdrop-blur-[0.5px] rounded-lg shadow-sm transition-transform duration-75"
            style={{
              width: `${lensSize.width}px`,
              height: `${lensSize.height}px`,
              transform: `translate(${lensPos.x}px, ${lensPos.y}px)`,
              left: 0,
              top: 0,
            }}
          />
        )}

        {/* Amazon style zoom prompt */}
        {!isVideo && !isHovering && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-semibold text-charcoal shadow-sm transition-opacity duration-200">
            <ZoomIn className="size-3.5 text-navy" />
            <span>Roll over image to zoom in</span>
          </div>
        )}

        {/* Mobile / Tablet Picture-in-Picture Mini-Map when zoomed */}
        {isHovering && !isVideo && (
          <div className="lg:hidden pointer-events-none absolute top-3 right-3 h-[85px] w-[65px] overflow-hidden rounded-xl border-2 border-white/90 bg-white shadow-lg">
            <Image src={current.src} alt="" width={65} height={85} className="size-full object-cover" />
            <span
              aria-hidden
              className="absolute border border-navy bg-navy/35 rounded-[2px]"
              style={{
                width: "40%",
                height: "40%",
                left: `${zoomRatio.x * 60}%`,
                top: `${zoomRatio.y * 60}%`,
              }}
            />
          </div>
        )}

        {isVideo && (
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-card/90 text-navy shadow-card">
              <Play className="size-6 fill-current" />
            </span>
          </span>
        )}
      </div>

      {/* Amazon-style Floating Zoom Window (elevated over the right area on desktop) */}
      {isHovering && !isVideo && (
        <div
          aria-label="Zoomed image detail"
          className="pointer-events-none absolute left-[calc(100%+16px)] top-0 z-50 hidden lg:block overflow-hidden rounded-[24px] border border-line bg-card shadow-2xl"
          style={{
            width: `${Math.min(520, viewerSize.width * 1.1)}px`,
            height: `${viewerSize.height}px`,
          }}
        >
          <div
            className="relative size-full overflow-hidden bg-soft"
            style={{
              backgroundImage: `url(${current.src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${viewerSize.width * 2.5}px ${viewerSize.height * 2.5}px`,
              backgroundPosition: `${zoomRatio.x * 100}% ${zoomRatio.y * 100}%`,
            }}
          >
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 rounded-full bg-navy/90 backdrop-blur-xs px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm">
              <ZoomIn className="size-3" />
              <span>2.5× ZOOM</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
