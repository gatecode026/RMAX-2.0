import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Stars } from "@/components/home/Stars";
import { initials } from "@/lib/home";
import { cn } from "@/lib/cn";
import type { ReviewSummary, TestimonialDTO } from "@/lib/data/content";

/** Heavy closing-quote glyph used on the testimonial panels. */
function QuoteMark({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 56 44" aria-hidden className={className} fill={color}>
      <g transform="rotate(180 28 22)">
        <path d="M0 22C0 9 7 2 20 0l1.5 7C15 9 12.5 13 12.5 18H22v26H0V22z" />
        <path d="M32 22C32 9 39 2 52 0l1.5 7C47 9 44.5 13 44.5 18H54v26H32V22z" />
      </g>
    </svg>
  );
}

function Avatar({ name, size, className }: { name: string; size: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-full bg-[#D9E4F5] font-jakarta font-bold text-navy", className)}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials(name)}
    </span>
  );
}

function FeaturedTestimonial({ t }: { t: TestimonialDTO }) {
  return (
    <figure className="grid overflow-hidden rounded-[32px] bg-navy text-white md:rounded-[40px] lg:grid-cols-[483px_1fr]">
      <div className="relative min-h-[300px] bg-soft lg:min-h-[461px]">
        {t.image && <Image src={t.image.src} alt={t.image.alt} width={t.image.width} height={t.image.height} className="absolute inset-0 size-full object-cover" />}
        {t.product && (
          <span className="absolute top-3 left-3 inline-flex h-[42px] items-center rounded-full bg-navy px-6 text-body font-semibold text-white">
            {t.product}
          </span>
        )}
      </div>
      <div className="relative flex flex-col bg-[linear-gradient(120deg,#174082_0%,#2F5995_100%)] px-6 py-8 md:p-10">
        <QuoteMark className="absolute top-[38px] right-10 hidden h-[55px] w-[71px] md:block" color="#FDFDFD" />
        <blockquote className="font-jakarta text-[26px]/[34px] font-semibold tracking-[-0.01em] text-white md:max-w-[640px] md:text-[40px]/[46px]">
          {t.quote}
        </blockquote>
        <figcaption className="mt-[30px] flex items-center gap-4">
          <Avatar name={t.name} size={58} className="ring-2 ring-white/30" />
          <div>
            <p className="font-jakarta text-[25px]/8 font-bold text-white">{t.name}</p>
            <p className="text-body text-muted-dark">{t.role}</p>
          </div>
        </figcaption>
        <hr className="mt-[31px] border-0 border-t border-white/30" />
        <div className="mt-[26px]">
          <ButtonLink href="/institutional-quote" variant="dark" className="h-[49px] px-8 text-[15px]">
            Discuss your requirements
          </ButtonLink>
        </div>
      </div>
    </figure>
  );
}

function ReviewCard({ t, active }: { t: TestimonialDTO; active: boolean }) {
  return (
    <figure
      className={cn(
        "relative rounded-[28px] border p-6",
        active ? "border-[#ECF1F8] bg-card shadow-[0_12px_32px_rgb(35_42_50/0.08)] lg:py-7" : "border-[#DDE6F2] bg-soft",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Stars value={t.rating} size={25} />
        <span className="text-[11px] text-muted">{t.dateLabel}</span>
      </div>
      <blockquote className="mt-4 pr-12 font-jakarta text-[16px]/6 font-semibold text-charcoal">{t.quote}</blockquote>
      <QuoteMark className="absolute top-[58px] right-6 h-[26px] w-[34px]" color="#002970" />
      <hr className="mt-5 border-0 border-t border-dashed border-line" />
      <figcaption className="mt-4 flex items-center gap-3">
        <Avatar name={t.name} size={38} />
        <div>
          <p className="font-jakarta text-[17px]/6 font-bold text-charcoal">{t.name}</p>
          <p className="text-[10px]/4 text-muted">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials({ items, reviews }: { items: TestimonialDTO[]; reviews: ReviewSummary }) {
  const featured = items.find((t) => t.featured);
  const cards = items.filter((t) => !t.featured && !t.forProduct).slice(0, 3);
  return (
    <section className="mx-auto mt-16 w-full max-w-(--container-home) px-5 sm:px-8 md:mt-[130px] xl:px-0" aria-labelledby="testimonials-heading">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[14px] font-extrabold tracking-[0.28em] text-navy uppercase">Testimonials</p>
          <h2 id="testimonials-heading" className="mt-2 font-jakarta text-[30px]/[38px] font-bold tracking-[-0.01em] text-charcoal md:text-[48px]/[56px]">
            Trusted by institutions across India.
          </h2>
        </div>
        <div className="flex h-[93px] w-full items-center justify-between gap-3 rounded-[28px] border border-[#ECF1F8] bg-card px-5 shadow-[0_2px_10px_rgb(35_42_50/0.04)] sm:w-[334px]">
          <p className="font-jakarta text-[48px]/[56px] font-bold text-charcoal">{reviews.rating}</p>
          <div className="flex flex-col items-end gap-1">
            <Stars value={reviews.stars} size={34} />
            <p className="text-[15px] leading-5 whitespace-nowrap text-muted">{reviews.label}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">{featured && <FeaturedTestimonial t={featured} />}</div>

      <div className="mt-6 grid items-center gap-6 lg:grid-cols-[1fr_1.167fr_1fr]">
        {cards.map((t, i) => (
          <ReviewCard key={t._id} t={t} active={i === 1} />
        ))}
      </div>

      {/* Pagination indicator as drawn in the design (decorative). */}
      <div className="mt-5 flex justify-center gap-2" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-2 rounded-full", i === 1 ? "w-7 bg-navy" : "w-2 bg-[#E5E8EC]")} />
        ))}
      </div>
    </section>
  );
}
