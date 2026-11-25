"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Play, ZoomIn } from "lucide-react";
import { cn } from "@/lib/cn";
import type { IGalleryItem } from "@/models/Product";

/** Thumbnail rail + large viewer with Amazon-style lens indicator and zoom flyout. */
export function ProductGallery({ items: all, title }: { items: IGalleryItem[]; title: string }) {
  // Images that fail to load (dead URL) are dropped from the rail and viewer instead of showing a broken icon.
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const items = useMemo(() => all.filter((g) => !broken.has(g.src) && !broken.has(g.thumb)), [all, broken]);
  const markBroken = (url: string) => setBroken((p) => new Set(p).add(url));
  const [active, setActive] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewerSize, setViewerSize] = useState({ width: 365, height: 420 });
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoomRatio, setZoomRatio] = useState({ x: 0.5, y: 0.5 });

  const readNatural = (el: HTMLImageElement) => {
    const { naturalWidth: w, naturalHeight: h } = el;
    if (w && h) setNatural((p) => (p.w === w && p.h === h ? p : { w, h }));
  };

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setViewerSize({ width: rect.width || 365, height: rect.height || 420 });
    }
  }, []);

  /** Rect the object-contain image actually occupies inside the viewer, so lens and zoom track the photo, not the letterbox. */
  const fit = (cw: number, ch: number) => {
    if (!natural.w || !natural.h) return { x: 0, y: 0, w: cw, h: ch };
    const s = Math.min(cw / natural.w, ch / natural.h);
    const w = natural.w * s;
    const h = natural.h * s;
    return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
  };
  const box = fit(viewerSize.width, viewerSize.height);
  const lensSize = { width: Math.round(box.w * 0.4), height: Math.round(box.h * 0.4) };
  const zoomW = Math.min(520, viewerSize.width * 1.1);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  useEffect(() => {
    setActive(0);
    setIsHovering(false);
  }, [items]);

  const current = items[active] ?? items[0];
  if (!current) return null;

  const isVideo = current.kind === "video";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVideo || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const b = fit(rect.width, rect.height);
    const lw = lensSize.width;
    const lh = lensSize.height;

    const lx = Math.max(b.x, Math.min(b.x + b.w - lw, mouseX - lw / 2));
    const ly = Math.max(b.y, Math.min(b.y + b.h - lh, mouseY - lh / 2));

    setLensPos({ x: lx, y: ly });
    setZoomRatio({
      x: Math.max(0, Math.min(1, (lx - b.x) / (b.w - lw || 1))),
      y: Math.max(0, Math.min(1, (ly - b.y) / (b.h - lh || 1))),
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
    <div className="relative flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:gap-3" aria-label={`${title} gallery`} role="group">
      {/* Thumbnail rail: Rendered when there are multiple images */}
      {items.length > 1 && (
        <ul className="flex shrink-0 gap-2 overflow-x-auto pb-1 sm:w-[62px] sm:flex-col sm:gap-2.5 sm:overflow-visible sm:pb-0">
          {items.map((g, i) => {
            const isCurrent = i === active;

            return (
              <li key={g.thumb || i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setIsHovering(false);
                  }}
                  aria-label={g.kind === "video" ? `Play video: ${g.alt}` : `Show image ${i + 1}: ${g.alt}`}
                  aria-current={isCurrent}
                  className={cn(
                    "relative block h-[74px] w-[58px] sm:h-[78px] sm:w-[62px] overflow-hidden rounded-[12px] border-2 bg-soft transition cursor-pointer",
                    isCurrent ? "border-navy shadow-xs" : "border-transparent hover:border-line",
                  )}
                >
                  <Image src={g.thumb} alt="" width={62} height={78} unoptimized={g.thumb.startsWith("http")} onError={() => markBroken(g.thumb)} className="size-full object-contain p-1" />
                  {/* Small thumbnail active zoom indicator */}
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
        style={{ aspectRatio: natural.w && natural.h ? `${natural.w} / ${natural.h}` : "461 / 530" }}
        className={cn(
          "group relative w-full self-start overflow-hidden rounded-[24px] bg-soft sm:w-[350px] md:w-[365px] xl:w-[380px] sm:max-w-full select-none",
          !isVideo && "cursor-crosshair",
        )}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={922}
          height={1086}
          unoptimized={current.src.startsWith("http")}
          priority={active === 0}
          onLoad={(e) => readNatural(e.currentTarget)}
          onError={() => markBroken(current.src)}
          // Cached/SSR images can finish loading before hydration, so onLoad never fires — read it on mount too.
          ref={(el) => {
            if (el?.complete) readNatural(el);
          }}
          className="size-full object-contain pointer-events-none"
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
            <Image src={current.src} alt="" width={65} height={85} unoptimized={current.src.startsWith("http")} className="size-full object-contain p-0.5" />
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
            width: `${zoomW}px`,
            height: `${viewerSize.height}px`,
          }}
        >
          <div
            className="relative size-full overflow-hidden bg-soft"
            style={{
              backgroundImage: `url(${current.src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${box.w * 2.5}px ${box.h * 2.5}px`,
              backgroundPosition: `${-zoomRatio.x * Math.max(0, box.w * 2.5 - zoomW)}px ${-zoomRatio.y * Math.max(0, box.h * 2.5 - viewerSize.height)}px`,
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
