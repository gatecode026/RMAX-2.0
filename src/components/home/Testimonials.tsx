"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Stars } from "@/components/home/Stars";
import { initials } from "@/lib/home";
import { cn } from "@/lib/cn";
import type { ReviewSummary, TestimonialDTO } from "@/lib/data/content";

/** Double quotation mark glyph matching the design (rotated 180 to face inside toward quote) */
function QuoteMark({ className = "size-6", fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("rotate-180", className)} fill={fill} aria-hidden="true">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

/** Featured Hero Testimonial matching the exact top card in the design */
function FeaturedTestimonial({ t }: { t: TestimonialDTO }) {
  return (
    <figure className="relative flex flex-col md:flex-row items-stretch overflow-hidden rounded-[28px] sm:rounded-[36px] border border-[#D9E4F2] md:rounded-[40px] bg-gradient-to-b from-[#BFD4F4] via-[#E9F0FD] to-[#BCD0F0]">
      {/* Product Image Section */}
      <div className="relative min-h-[260px] md:min-h-[360px] md:w-[280px] lg:w-[360px] xl:min-h-[460px] xl:w-[480px] shrink-0 overflow-hidden flex items-center justify-center">
        {t.image && (
          <Image
            src={t.image.src}
            alt={t.image.alt}
            width={t.image.width}
            height={t.image.height}
            className="absolute inset-0 size-full object-cover object-center md:object-left"
          />
        )}
        {t.product && (
          <span className="absolute top-4 left-4 z-20 inline-flex items-center rounded-full bg-[#0A2558] px-4 py-1.5 text-[12px] font-bold text-white shadow-xs">
            {t.product}
          </span>
        )}
      </div>

      {/* Featured Quote Section - overlaps the image on the left by 32px so the photo seamlessly shows behind the rounded card corners */}
      <div className="relative z-10 flex flex-1 flex-col justify-between rounded-[24px] md:rounded-[36px] -mt-5 md:mt-0 md:-ml-6 xl:-ml-8 bg-gradient-to-br from-[#18427F] to-[#245CA4] p-6 sm:p-7 md:p-8 xl:p-12 text-white shadow-[0_12px_36px_rgba(10,37,88,0.18)]">
        {/* Quote text row with cleanly aligned quotation mark at top-right */}
        <div className="relative flex items-start justify-between gap-6">
          <blockquote className="font-heading font-semibold text-[18px]/[26px] sm:text-[20px]/[28px] md:text-[22px]/[32px] lg:text-[26px]/[38px] xl:text-[32px]/[46px] tracking-[0.01em] text-[#FDFDFD] max-w-[641px] pr-12 sm:pr-16 md:pr-20">
            {t.quote}
          </blockquote>
          <QuoteMark className="absolute top-1 right-2 sm:right-4 md:right-6 lg:right-8 size-8 sm:size-9 lg:size-11 xl:size-12 shrink-0 text-white/95" fill="currentColor" />
        </div>

        <div className="mt-8">
          {/* Author Profile */}
          <figcaption className="flex items-center gap-4">
            <div className="flex size-11 lg:size-[48px] xl:size-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#CBDDF5] to-[#A3C5EC] font-jakarta text-[15px] xl:text-[17px] font-extrabold text-[#0A2558] shadow-xs">
              {initials(t.name)}
            </div>
            <div>
              <p className="font-jakarta text-[18px] sm:text-[20px] font-bold text-white xl:text-[22px] leading-tight">{t.name}</p>
              <p className="text-[14px] text-white/80 mt-0.5 leading-normal">{t.role}</p>
            </div>
          </figcaption>

          {/* Subtle Accent Divider with End Dots */}
          <div className="relative my-5 flex items-center lg:my-6 xl:my-7" aria-hidden="true">
            <div className="h-[1px] w-full bg-white/20" />
            <div className="absolute left-0 size-1 rounded-full bg-white/50" />
            <div className="absolute right-0 size-1 rounded-full bg-white/50" />
          </div>

          {/* Action Button */}
          <div>
            <Link
              href="/institutional-quote"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 sm:px-8 sm:py-3.5 text-[13px] sm:text-[14px] font-bold text-[#18427F] shadow-sm transition-colors hover:bg-[#F0F4FA]"
            >
              Discuss your requirements
            </Link>
          </div>
        </div>
      </div>
    </figure>
  );
}

/** Individual Review Card matching the exact 3-card carousel design */
function ReviewCard({
  t,
  active,
  onClick,
}: {
  t: TestimonialDTO;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <figure
      onClick={onClick}
      className={cn(
        "flex flex-col justify-between rounded-[20px] sm:rounded-[24px] p-4.5 sm:p-5 lg:p-7 transition-all duration-300 cursor-pointer select-none",
        active
          ? "border border-[#E2E8F0] bg-white shadow-[0_12px_36px_rgba(35,42,50,0.08)] md:scale-[1.02] z-10 ring-1 ring-[#0A2558]/5"
          : "border border-[#D9E4F2] bg-[#F0F4FA] opacity-90 hover:opacity-100 hover:border-[#CBD5E1]"
      )}
    >
      {/* Top Row: Stars + Date */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <svg key={idx} className="size-3.5 sm:size-4 lg:size-[18px] text-[#0A2558] fill-[#0A2558]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.3l-5.8 3.1 1.1-6.47L2.6 9.35l6.5-.95L12 2.5z" />
              </svg>
            ))}
          </div>
          <span className="text-[11.5px] sm:text-[12px] lg:text-[13px] font-normal text-[#64748B]">{t.dateLabel}</span>
        </div>

        {/* Body: Quote Text & Double Quote Icon */}
        <div className="mt-4 flex items-start justify-between gap-3">
          <blockquote className="font-jakarta text-[13px]/[20px] sm:text-[13.5px]/[21px] lg:text-[15px]/[24px] font-semibold text-[#1E293B]">
            {t.quote}
          </blockquote>
          <QuoteMark className="size-4.5 sm:size-5 lg:size-6 shrink-0 text-[#0A2558] fill-[#0A2558] mt-0.5" />
        </div>
      </div>

      {/* Bottom Section: Divider & Author */}
      <div className="mt-5">
        {/* Accent Divider with End Dots */}
        <div className="relative my-4 flex items-center" aria-hidden="true">
          <div className="h-[1px] w-full bg-[#D6E0EE]" />
          <div className="absolute left-0 size-1 rounded-full bg-[#94A3B8]" />
          <div className="absolute right-0 size-1 rounded-full bg-[#94A3B8]" />
        </div>

        {/* Author Profile */}
        <figcaption className="flex items-center gap-3">
          <div className="flex size-9 sm:size-10 lg:size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#CBDDF5] to-[#A3C5EC] font-jakarta text-[12px] sm:text-[13px] lg:text-[14px] font-bold text-[#0A2558]">
            {initials(t.name)}
          </div>
          <div className="min-w-0">
            <p className="font-jakarta text-[13.5px] sm:text-[14px] lg:text-[15px] font-bold leading-snug text-[#1E293B] truncate">{t.name}</p>
            <p className="text-[11px] sm:text-[11.5px] lg:text-[12px] leading-tight text-[#64748B] mt-0.5 truncate">{t.role}</p>
          </div>
        </figcaption>
      </div>
    </figure>
  );
}

export function Testimonials({
  featured: propFeatured,
  reviews,
  testimonials,
  items,
}: {
  featured?: TestimonialDTO;
  reviews: ReviewSummary;
  testimonials?: TestimonialDTO[];
  items?: TestimonialDTO[];
}) {
  const allTestimonials = testimonials ?? items ?? [];
  const featured = propFeatured ?? allTestimonials.find((t) => t.featured) ?? allTestimonials[0];
  const cards = allTestimonials.slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(1);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  // Touch swipe support for mobile/tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Calculate sliding transform offset for both mobile and desktop
  // Desktop shows 3 cards simultaneously. When activeIndex is 2 or 3, slide by 1 card.
  const desktopOffset = activeIndex >= 2 ? "calc(-33.333% - 16px)" : "0px";
  const mobileOffset = `-${activeIndex * 100}%`;

  return (
    <section className="mx-auto mt-16 w-full max-w-(--container-page) px-5 sm:px-8 md:mt-[90px] lg:px-8 xl:px-16 xl:mt-[130px]" aria-labelledby="testimonials-heading">
      {/* Header with Title and Rating Summary Box (Single row on desktop, rating locked to top-right) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div>
          <p className="text-[12px] font-extrabold tracking-[0.2em] text-navy uppercase">Testimonials</p>
          <h2 id="testimonials-heading" className="mt-1.5 font-heading text-[24px]/[32px] sm:text-[26px]/[34px] md:text-[30px]/[38px] lg:text-[36px]/[44px] xl:text-[44px]/[52px] 2xl:text-[48px]/[56px] font-extrabold tracking-[-0.02em] text-charcoal sm:whitespace-nowrap">
            Trusted by institutions across India.
          </h2>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3.5 lg:gap-4 rounded-[12px] sm:rounded-[14px] border border-line bg-card p-3 sm:p-3.5 lg:p-4 shadow-[0_2px_12px_rgba(0,41,112,0.04)] shrink-0 self-start sm:self-auto">
          <p className="font-heading text-[28px] sm:text-[32px] lg:text-[38px] xl:text-[40px] font-extrabold text-charcoal leading-none">{reviews.rating}</p>
          <div className="flex flex-col items-start gap-1">
            <Stars value={reviews.stars} size={20} />
            <p className="text-[12px] font-medium leading-none whitespace-nowrap text-muted">{reviews.label}</p>
          </div>
        </div>
      </div>

      {/* Top Featured Hero Banner */}
      <div className="mt-8">{featured && <FeaturedTestimonial t={featured} />}</div>

      {/* Functional Review Cards Carousel Viewport */}
      <div
        className="mt-6 -my-4 overflow-hidden py-6 px-1.5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track for Mobile (1 card per view) */}
        <div
          className="flex md:hidden transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${mobileOffset})` }}
        >
          {cards.map((t, i) => (
            <div key={t._id} className="w-full shrink-0 px-1">
              <ReviewCard
                t={t}
                active={i === activeIndex}
                onClick={() => setActiveIndex(i)}
              />
            </div>
          ))}
        </div>

        {/* Track for Tablet & Desktop (3 cards per view) */}
        <div
          className="hidden md:flex gap-4 xl:gap-6 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${desktopOffset})` }}
        >
          {cards.map((t, i) => (
            <div key={t._id} className="w-[calc(33.333%-11px)] xl:w-[calc(33.333%-16px)] shrink-0">
              <ReviewCard
                t={t}
                active={i === activeIndex}
                onClick={() => setActiveIndex(i)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Functional Interactive Pagination Indicator Dots */}
      <div
        className="mt-8 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Review pagination"
      >
        {cards.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={activeIndex === i}
            aria-label={`Go to review ${i + 1}`}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "h-2 transition-all duration-300 rounded-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-navy",
              activeIndex === i
                ? "w-6 bg-[#0A2558]"
                : "w-2 bg-[#CBD5E1] hover:bg-[#94A3B8] cursor-pointer"
            )}
          />
        ))}
      </div>
    </section>
  );
}
