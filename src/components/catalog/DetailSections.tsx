import Image from "next/image";
import {
  Building2,
  Cog,
  Flame,
  Hospital,
  Landmark,
  Leaf,
  School,
  Settings,
  ShieldCheck,
  Truck,
  Wrench,
  Hotel,
  Users,
  Briefcase,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Stars } from "@/components/home/Stars";
import { FeaturedTestimonial } from "@/components/home/Testimonials";
import type { DetailIcon, IDetailPoint } from "@/models/Product";
import type { TestimonialDTO, TrustPoint } from "@/lib/data/content";
import { initials } from "@/lib/home";
import { cn } from "@/lib/cn";

const ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  truck: Truck,
  cog: Cog,
  flame: Flame,
  settings: Settings,
  leaf: Leaf,
  wrench: Wrench,
  school: School,
  hospital: Hospital,
  office: Building2,
  institution: Landmark,
  hotel: Hotel,
  users: Users,
  briefcase: Briefcase,
  graduation: GraduationCap,
};

function resolveApplicationIcon(icon?: string, title?: string): LucideIcon {
  const t = (title || "").toLowerCase();
  if (t.includes("school") || t.includes("college") || t.includes("campus") || t.includes("education") || t.includes("institute") || t.includes("universit")) return School;
  if (t.includes("office") || t.includes("workplace") || t.includes("corporate") || t.includes("workspace") || t.includes("business")) return Building2;
  if (t.includes("hospital") || t.includes("clinic") || t.includes("health") || t.includes("medical") || t.includes("nursing")) return Hospital;
  if (t.includes("hotel") || t.includes("hospitality") || t.includes("resort") || t.includes("hostel") || t.includes("guest")) return Hotel;
  if (t.includes("washroom") || t.includes("restroom") || t.includes("toilet") || t.includes("community")) return Users;
  if (t.includes("transit") || t.includes("station") || t.includes("airport") || t.includes("hub") || t.includes("commercial") || t.includes("public")) return Landmark;
  if (t.includes("factory") || t.includes("industry") || t.includes("plant") || t.includes("warehouse")) return Cog;
  if (t.includes("eco") || t.includes("green") || t.includes("waste")) return Leaf;
  if (icon && ICONS[icon]) return ICONS[icon];
  return Landmark;
}

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

/** Always a 2×2 bento grid — never widens to a single row, regardless of container width. */
export function SpecTiles({ tiles }: { tiles: { value: string; label: string }[] }) {
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3">
      {tiles.map((t) => (
        <li key={t.label} className="rounded-[16px] bg-soft px-5 py-4">
          <p className="font-sans text-[18px]/6 font-bold text-charcoal">{t.value}</p>
          <p className="mt-0.5 text-[13px]/4 text-muted">{t.label}</p>
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
  const hasImage = Boolean(image?.src);
  return (
    <section
      id="overview"
      aria-labelledby="overview-h"
      className={cn(
        "scroll-mt-20 grid gap-6",
        hasImage ? "lg:grid-cols-[1fr_540px] xl:grid-cols-[1fr_641px]" : "grid-cols-1"
      )}
    >
      <div className={cn(card, "p-7 md:p-8 lg:min-h-[220px]")}>
        <h2 id="overview-h" className={h2}>
          Product overview.
        </h2>
        <p className="mt-4 text-body leading-[26px] text-muted">{text}</p>
      </div>
      {hasImage && image && (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          unoptimized={image.src.startsWith("http")}
          className="h-[220px] w-full rounded-[24px] object-cover sm:h-[276px]"
        />
      )}
    </section>
  );
}

function IconTile({ icon }: { icon: DetailIcon }) {
  const Icon = ICONS[icon] || Settings;
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
  const count = items.length;
  const gridClass =
    count === 1
      ? "grid-cols-1"
      : count === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : count === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section id="applications" aria-labelledby="applications-h" className={cn(card, "flex flex-1 scroll-mt-20 flex-col p-7 md:p-8")}>
      <div className="flex items-center justify-between">
        <h2 id="applications-h" className={h2}>
          Applications.
        </h2>
        <span className="text-[12px] font-semibold text-muted bg-soft px-3 py-1 rounded-full">
          {items.length} Environments
        </span>
      </div>
      <ul className={cn("mt-6 grid flex-1 content-start gap-4", gridClass)}>
        {items.map((a) => {
          const Icon = resolveApplicationIcon(a.icon, a.title);
          return (
            <li
              key={a.title}
              className="group flex flex-col justify-between rounded-[20px] border border-line/70 bg-[#F8FAFC] p-5 transition-all duration-200 hover:border-navy/30 hover:bg-white hover:shadow-xs"
            >
              <div>
                <div className="grid size-11 place-items-center rounded-[14px] bg-white text-navy shadow-[0_2px_8px_rgba(47,85,150,0.08)] border border-line/40 transition-transform duration-200 group-hover:scale-105">
                  <Icon className="size-5" strokeWidth={1.8} aria-hidden />
                </div>
                <h3 className="mt-4 text-[14px]/[20px] font-bold text-charcoal group-hover:text-navy transition-colors">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-[12.5px]/[19px] text-muted leading-relaxed">
                  {a.body}
                </p>
              </div>
            </li>
          );
        })}
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

/** Navy testimonial banner at the foot of the detail page (same to same with homepage). */
export function ProductTestimonial({ t }: { t: TestimonialDTO }) {
  return <FeaturedTestimonial t={t} />;
}
