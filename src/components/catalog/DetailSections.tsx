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
const h2 = "font-jakarta text-[24px]/8 font-bold tracking-[-0.005em] text-charcoal";

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
    <ul className="mt-5 grid grid-cols-2 gap-3">
      {tiles.map((t) => (
        <li key={t.label} className="rounded-[14px] bg-soft px-4 py-3.5">
          <p className="font-jakarta text-[16px]/6 font-semibold text-charcoal">{t.value}</p>
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

/** Navy testimonial banner at the foot of the detail page (photo · quote · author · CTA · pager dots). */
export function ProductTestimonial({ t }: { t: TestimonialDTO }) {
  return (
    <figure className="grid overflow-hidden rounded-[32px] bg-navy text-white md:rounded-[40px] lg:grid-cols-[402px_1fr]">
      <div className="relative min-h-[260px] bg-soft lg:min-h-[297px]">
        {t.image && <Image src={t.image.src} alt={t.image.alt} width={t.image.width} height={t.image.height} className="absolute inset-0 size-full object-cover" />}
        {t.product && (
          <span className="absolute top-3 left-3 inline-flex h-9 items-center rounded-full bg-navy px-4 text-[12px] font-bold text-white">{t.product}</span>
        )}
      </div>
      <div className="relative flex flex-col justify-center gap-5 px-6 py-8 md:px-10">
        <div className="flex gap-4">
          <svg viewBox="0 0 56 44" aria-hidden className="mt-1 h-6 w-8 shrink-0 text-card" fill="currentColor">
            <g transform="rotate(180 28 22)">
              <path d="M0 22C0 9 7 2 20 0l1.5 7C15 9 12.5 13 12.5 18H22v26H0V22z" />
              <path d="M32 22C32 9 39 2 52 0l1.5 7C47 9 44.5 13 44.5 18H54v26H32V22z" />
            </g>
          </svg>
          <blockquote className="font-jakarta text-[20px]/7 font-bold text-white md:text-[24px]/8">{t.quote}</blockquote>
        </div>
        <figcaption className="flex items-center gap-3 md:pl-12">
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-card font-jakarta text-[13px] font-bold text-navy">
            {initials(t.name)}
          </span>
          <div>
            <p className="font-jakarta text-[16px]/6 font-bold text-white">{t.name}</p>
            <p className="text-[12px]/4 text-muted-dark">{t.role}</p>
          </div>
        </figcaption>
        <div className="md:pl-12">
          <ButtonLink href="/institutional-quote" variant="dark" className="h-[46px] px-7 text-body-sm">
            Discuss your requirements
          </ButtonLink>
        </div>
        <div aria-hidden className="absolute right-8 bottom-6 hidden items-center gap-2 md:flex">
          <span className="h-2 w-3.5 rounded-full bg-white" />
          <span className="size-2 rounded-full border border-white/80" />
          <span className="size-2 rounded-full border border-white/80" />
        </div>
      </div>
    </figure>
  );
}
