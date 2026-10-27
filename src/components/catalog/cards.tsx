import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { perDay, specChips } from "@/lib/home";
import { cn } from "@/lib/cn";
import type { ProductDTO } from "@/lib/data/content";

const BADGE_TONE = {
  light: "bg-card text-charcoal shadow-[0_2px_8px_rgb(35_42_50/0.15)]",
  navy: "bg-navy text-white",
  green: "bg-success text-white",
} as const;

/** Product page route for a catalogue item. */
export const productHref = (p: Pick<ProductDTO, "slug">) => `/products/${p.slug}`;

function Badge({ badge }: { badge: NonNullable<ProductDTO["badge"]> }) {
  // The badge is also baked into the supplied photos; this live one sits a little larger on top of it.
  return (
    <span
      className={cn(
        "absolute top-3 left-3 inline-flex h-8 items-center rounded-full px-4 text-[12px] font-bold tracking-wide uppercase",
        BADGE_TONE[badge.tone],
      )}
    >
      {badge.label}
    </span>
  );
}

function PriceBlock({ product, small }: { product: ProductDTO; small?: boolean }) {
  const hasOriginal = product.originalPrice > product.price;
  return (
    <div>
      {hasOriginal ? (
        <p className={cn("line-through", small ? "text-[12px] text-muted" : "text-body-sm text-muted-dark")}>
          <span className="sr-only">Original price </span>
          {formatINR(product.originalPrice)}
        </p>
      ) : (
        <p aria-hidden className="h-5" />
      )}
      <p className="font-jakarta text-[32px]/10 font-bold text-charcoal">{formatINR(product.price)}</p>
    </div>
  );
}

/** Photo-led card (Home "Best sellers", Listing row 1). `clamp` truncates the description to two lines. */
export function ShowcaseCard({
  product,
  clamp = false,
  variant = "home",
  imageHeight = 280,
}: {
  product: ProductDTO;
  clamp?: boolean;
  /** "listing" uses the narrower photo cut for the 3-column listing grid. */
  variant?: "home" | "listing";
  imageHeight?: number;
}) {
  const img = (variant === "listing" ? product.listImage : undefined) ?? product.cardImage ?? product.image;
  const chips = product.chips ?? specChips(product.specs);
  return (
    <article className="group relative flex h-full flex-col rounded-[32px] border border-[#ECF1F8] bg-card p-3.5 shadow-[0_4px_20px_rgb(35_42_50/0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-navy/20 hover:shadow-[0_16px_36px_rgb(0_41_112/0.09)]">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-[#eaf0f8] to-[#f4f7fb]" style={{ height: imageHeight }}>
        <Image
          src={img.src}
          alt={img.alt}
          width={img.width}
          height={img.height}
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {product.badge && <Badge badge={product.badge} />}
      </div>

      <div className="relative -mt-7 mx-1.5 flex flex-1 flex-col rounded-[24px] border border-line/60 bg-card p-5 shadow-[0_8px_24px_rgb(35_42_50/0.06)] backdrop-blur-sm transition-all duration-300 group-hover:border-navy/15 group-hover:shadow-[0_12px_28px_rgb(0_41_112/0.08)]">
        <h3 className="font-jakarta text-[20px]/7 font-bold tracking-[-0.01em] text-charcoal transition-colors group-hover:text-navy md:text-[22px]/8 text-balance">
          <Link href={productHref(product)} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        {product.summary && <p className={cn("mt-2.5 text-body text-muted", clamp && "line-clamp-2")}>{product.summary}</p>}

        <ul className="mt-4 grid grid-cols-2 gap-2">
          {chips.map((c, i) => (
            <li
              key={i}
              className={cn(
                "flex h-10 items-center justify-center rounded-[12px] px-3 text-[11px] font-bold text-charcoal border transition-colors whitespace-nowrap",
                product.highlight ? "bg-soft border-navy/10" : "bg-canvas border-line/50",
              )}
            >
              {c}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <PriceBlock product={product} />
          <ButtonLink
            href={productHref(product)}
            variant="charcoal"
            className="mb-1 inline-flex h-11 items-center gap-1.5 rounded-full px-6 text-body-sm font-bold shadow-sm transition-all hover:bg-navy hover:shadow-md hover:translate-x-0.5"
            aria-label={`View ${product.title}`}
          >
            View
            <span aria-hidden className="transition-transform duration-200">→</span>
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

/** Spec-tile card (Listing row 2): portrait photo, 2×2 value/label tiles and a "View Detail" button. */
export function DetailCard({ product }: { product: ProductDTO }) {
  const img = product.portraitImage ?? product.cardImage ?? product.image;
  const s = product.specs;
  const batchKnown = s.batchCapacity && s.batchCapacity !== "Not specified";
  const tiles = product.chips
    ? product.chips.map((c) => ({ value: c, label: "" }))
    : [
        { value: s.power, label: "Power" },
        { value: s.weight, label: "Weight" },
        { value: s.dailyCapacity, label: "Daily capacity" },
        batchKnown ? { value: s.batchCapacity, label: "Batch capacity" } : { value: s.colours, label: "Colours" },
      ];
  return (
    <article className="group relative flex h-full flex-col rounded-[32px] border border-[#ECF1F8] bg-card p-3.5 shadow-[0_4px_20px_rgb(35_42_50/0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-navy/20 hover:shadow-[0_16px_36px_rgb(0_41_112/0.09)]">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-[#eaf0f8] to-[#f4f7fb]" style={{ height: 280 }}>
        <Image
          src={img.src}
          alt={img.alt}
          width={img.width}
          height={img.height}
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {product.badge && <Badge badge={product.badge} />}
      </div>
      <div className="relative -mt-7 mx-1.5 flex flex-1 flex-col rounded-[24px] border border-line/60 bg-card p-5 shadow-[0_8px_24px_rgb(35_42_50/0.06)] backdrop-blur-sm transition-all duration-300 group-hover:border-navy/15 group-hover:shadow-[0_12px_28px_rgb(0_41_112/0.08)]">
        <h3 className="font-jakarta text-[20px]/7 font-bold tracking-[-0.01em] text-charcoal transition-colors group-hover:text-navy md:text-[22px]/8 text-balance">
          <Link href={productHref(product)} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        <ul className="mt-4 grid grid-cols-2 gap-2.5">
          {tiles.map((t, i) => (
            <li
              key={i}
              className="flex flex-col justify-center rounded-[14px] border border-[#e8eff7] bg-[#f8fafc] px-3.5 py-2.5 transition-colors group-hover:bg-soft/60"
            >
              <p className="font-jakarta text-[15px]/5 font-bold tracking-tight text-charcoal whitespace-nowrap">{t.value}</p>
              {t.label && <p className="mt-0.5 text-[11px]/4 font-semibold text-muted uppercase tracking-wider">{t.label}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <PriceBlock product={product} small />
          <ButtonLink
            href={productHref(product)}
            className="mb-1 inline-flex h-11 items-center gap-1.5 rounded-full bg-navy px-6 text-body-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-navy-600 hover:shadow-md hover:translate-x-0.5"
          >
            View Detail
            <span aria-hidden className="transition-transform duration-200">→</span>
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

/** Compact card used in "Related products" on the detail page. */
export function RelatedCard({ product }: { product: ProductDTO }) {
  const img = product.cardImage ?? product.image;
  const s = product.specs;
  const chips = product.chips ?? [s.power, s.weight, perDay(s.dailyCapacity)];
  return (
    <article className="group relative flex h-full flex-col rounded-[32px] border border-[#ECF1F8] bg-card p-3.5 shadow-[0_4px_20px_rgb(35_42_50/0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgb(0_41_112/0.09)]">
      <div className="relative h-[220px] overflow-hidden rounded-[24px] bg-gradient-to-b from-[#eaf0f8] to-[#f4f7fb]">
        <Image
          src={img.src}
          alt={img.alt}
          width={img.width}
          height={img.height}
          className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {product.badge && <Badge badge={product.badge} />}
      </div>
      <div className="relative -mt-6 mx-1 flex flex-1 flex-col rounded-[22px] border border-line/60 bg-card p-4 shadow-[0_6px_20px_rgb(35_42_50/0.05)] transition-all">
        <h3 className="font-jakarta text-[20px]/7 font-bold tracking-[-0.01em] text-charcoal group-hover:text-navy transition-colors text-balance">
          <Link href={productHref(product)} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        <ul className={cn("mt-4 grid gap-2", chips.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {chips.map((c, i) => (
            <li key={i} className="flex h-9 items-center justify-center rounded-[10px] bg-[#F4F6FA] px-2 text-[11px] font-semibold text-muted whitespace-nowrap">
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <PriceBlock product={product} small />
          <ButtonLink href={productHref(product)} className="mb-1 h-11 px-6 text-body-sm font-bold" aria-label={`View ${product.title}`}>
            View
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
