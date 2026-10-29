import Image from "next/image";
import { Building2, Cog, Flame, Hospital, Landmark, Leaf, School, Settings, ShieldCheck, Truck, Wrench, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Stars } from "@/components/home/Stars";
import type { DetailIcon, IDetailPoint } from "@/models/Product";
import type { TestimonialDTO, TrustPoint } from "@/lib/data/content";
import { initials } from "@/lib/home";
import { cn } from "@/lib/cn";

const ICONS: Record<DetailIcon, LucideIcon> = {
  flame: Flame,
  settings: Settings,
  leaf: Leaf,
  wrench: Wrench,
  school: School,
  hospital: Hospital,
  office: Building2,
  institution: Landmark,
};

const TRUST_ICONS: Record<TrustPoint["icon"], LucideIcon> = { shield: ShieldCheck, truck: Truck, cog: Cog };

const card = "rounded-[28px] border border-[#ECF1F8] bg-card shadow-[0_6px_24px_rgb(35_42_50/0.04)]";
const h2 = "font-heading text-title font-extrabold tracking-[-0.6px] text-charcoal";

export function RatingRow({ rating, label, stars }: { rating: string; label: string; stars: number }) {
  return (
    <p className="flex items-center gap-2 text-body-sm">
      <span className="font-bold text-charcoal">{rating}</span>
      <Stars value={stars} size={16} />
      <span className="text-[11px] text-muted">{label}</span>
    </p>
  );
}

export function SpecTiles({ tiles }: { tiles: { value: string; label: string }[] }) {
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t) => (
        <li key={t.label} className="rounded-[14px] bg-soft px-4 py-3.5">
          <p className="font-sans text-body font-semibold text-charcoal">{t.value}</p>
          <p className="text-[11px]/4 text-muted">{t.label}</p>
        </li>
      ))}
    </ul>
  );
}

export function TrustRow({ points }: { points: TrustPoint[] }) {
  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-3">
      {points.map((p) => {
        const Icon = TRUST_ICONS[p.icon] ?? ShieldCheck;
        return (
          <li key={p.title} className="flex items-start gap-3">
            <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-navy" />
            <div>
              <p className="text-body-sm font-semibold text-charcoal">{p.title}</p>
              <p className="text-[11px]/4 text-muted">{p.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function OverviewSection({ text, image }: { text: string; image?: { src: string; alt: string; width: number; height: number } }) {
  return (
    <section id="overview" aria-labelledby="overview-h" className="scroll-mt-20 grid gap-6 lg:grid-cols-[1fr_641px]">
      <div className={cn(card, "p-7 md:p-8 lg:min-h-[276px]")}>
        <h2 id="overview-h" className={h2}>
          Product overview.
        </h2>
        <p className="mt-4 text-body leading-[26px] text-muted">{text}</p>
      </div>
      {image && <Image src={image.src} alt={image.alt} width={image.width} height={image.height} className="h-[220px] w-full rounded-[24px] object-cover sm:h-[276px]" />}
    </section>
  );
}

function IconTile({ icon }: { icon: DetailIcon }) {
  const Icon = ICONS[icon];
  return (
    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-soft text-navy">
      <Icon className="size-5" strokeWidth={1.6} />
    </span>
  );
}

export function FeaturesCard({ items }: { items: IDetailPoint[] }) {
  return (
    <section id="features" aria-labelledby="features-h" className={cn(card, "flex flex-1 scroll-mt-20 flex-col p-7 md:p-8")}>
      <h2 id="features-h" className={h2}>
        Key features.
      </h2>
      <ul className="mt-6 grid flex-1 grid-rows-[repeat(4,1fr)] gap-x-6 sm:grid-cols-2 sm:grid-rows-2">
        {items.map((f, i) => (
          <li key={f.title} className={cn("flex items-start gap-4 py-5", i >= 1 && "border-t border-line sm:border-t-0", i >= 2 && "sm:border-t sm:border-line")}>
            <IconTile icon={f.icon} />
            <div>
              <h3 className="text-body-sm font-bold text-charcoal">{f.title}</h3>
              <p className="mt-1 text-body-sm text-muted">{f.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ApplicationsCard({ items }: { items: IDetailPoint[] }) {
  return (
    <section id="applications" aria-labelledby="applications-h" className={cn(card, "flex flex-1 scroll-mt-20 flex-col p-7 md:p-8")}>
      <h2 id="applications-h" className={h2}>
        Applications.
      </h2>
      <ul className="mt-6 grid flex-1 grid-cols-2 content-center gap-x-4 gap-y-6 sm:grid-cols-4">
        {items.map((a) => (
          <li key={a.title}>
            <IconTile icon={a.icon} />
            <h3 className="mt-3 text-[12px]/4 font-bold text-charcoal">{a.title}</h3>
            <p className="mt-1 text-[11px]/4 text-muted">{a.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TechSpecsCard({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <section id="specifications" aria-labelledby="specs-h" className={cn(card, "scroll-mt-20 p-7 md:p-8")}>
      <h2 id="specs-h" className={h2}>
        Technical specifications.
      </h2>
      <dl className="mt-6">
        {rows.map((r, i) => (
          <div key={r.label} className={cn("grid grid-cols-[1fr_1fr] gap-4 py-[14px] text-body-sm leading-5", i > 0 && "border-t border-line")}>
            <dt className="text-muted">{r.label}</dt>
            <dd className="text-charcoal">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Navy testimonial banner at the foot of the detail page (matching design). */
export function ProductTestimonial({ t }: { t: TestimonialDTO }) {
  return (
    <figure className="grid overflow-hidden rounded-[36px] bg-[#EEF4FB] border border-[#D9E4F2] md:rounded-[40px] lg:grid-cols-[402px_1fr]">
      <div className="relative min-h-[260px] bg-gradient-to-b from-[#eaf0f8] to-[#f4f7fb] lg:min-h-[320px]">
        {t.image && (
          <Image
            src={t.image.src}
            alt={t.image.alt}
            width={t.image.width}
            height={t.image.height}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {t.product && (
          <span className="absolute top-4 left-4 z-10 inline-flex items-center rounded-full bg-[#0A2558] px-4 py-1.5 text-[12px] font-bold text-white shadow-xs">
            {t.product}
          </span>
        )}
      </div>
      <div className="relative flex flex-col justify-between rounded-[32px] md:rounded-[36px] bg-gradient-to-br from-[#18427F] to-[#245CA4] p-8 md:p-10 text-white">
        <svg viewBox="0 0 24 24" className="absolute top-8 right-8 size-12 text-white/90" fill="currentColor" aria-hidden="true">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>

        <blockquote className="font-jakarta text-[22px] sm:text-[26px] font-bold leading-snug tracking-tight text-white max-w-[540px] pr-12">
          {t.quote}
        </blockquote>

        <div className="mt-6">
          <figcaption className="flex items-center gap-3.5">
            <div className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#CBDDF5] to-[#A3C5EC] font-jakarta text-[16px] font-extrabold text-[#0A2558]">
              {initials(t.name)}
            </div>
            <div>
              <p className="font-jakarta text-[18px] font-bold text-white leading-tight">{t.name}</p>
              <p className="text-[13px] text-white/80 mt-0.5">{t.role}</p>
            </div>
          </figcaption>

          <div className="relative my-5 flex items-center" aria-hidden="true">
            <div className="h-[1px] w-full bg-white/20" />
            <div className="absolute left-0 size-1 rounded-full bg-white/50" />
            <div className="absolute right-0 size-1 rounded-full bg-white/50" />
          </div>

          <div>
            <ButtonLink
              href="/institutional-quote"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-[14px] font-bold text-[#18427F] shadow-sm transition-colors hover:bg-[#F0F4FA]"
            >
              Discuss your requirements
            </ButtonLink>
          </div>
        </div>
      </div>
    </figure>
  );
}
