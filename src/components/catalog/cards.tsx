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
  imageHeight = 311,
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
    <article className="flex h-full flex-col rounded-[32px] border border-[#ECF1F8] bg-card p-[15px] shadow-[0_6px_24px_rgb(35_42_50/0.05)]">
      <div className="relative overflow-hidden rounded-[24px]" style={{ height: imageHeight }}>
        <Image src={img.src} alt={img.alt} width={img.width} height={img.height} className="size-full object-cover" />
        {product.badge && <Badge badge={product.badge} />}
      </div>

      <div className="flex flex-1 flex-col px-[3px] pt-4">
        <h3 className="font-jakarta text-[22px]/8 font-bold tracking-[-0.01em] text-charcoal md:text-[24px]/8">
          <Link href={productHref(product)} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        {product.summary && <p className={cn("mt-3 text-body text-muted", clamp && "line-clamp-2")}>{product.summary}</p>}

        <ul className={cn("mt-4 grid gap-2", chips.length > 2 ? "grid-cols-2" : "grid-cols-2")}>
          {chips.map((c, i) => (
            <li
              key={i}
              className={cn(
                "flex h-10 items-center rounded-[10px] px-3 text-[10.5px] font-bold text-charcoal",
                product.highlight ? "bg-soft" : "bg-canvas",
              )}
            >
              {c}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <PriceBlock product={product} />
          <ButtonLink href={productHref(product)} variant="charcoal" className="mb-1 h-11 px-7 text-body-sm" aria-label={`View ${product.title}`}>
            View
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
    <article className="relative flex h-full flex-col rounded-[32px] border border-[#ECF1F8] bg-card p-[15px] shadow-[0_6px_24px_rgb(35_42_50/0.05)]">
      <div className="overflow-hidden rounded-[24px] bg-soft" style={{ height: 311 }}>
        <Image src={img.src} alt={img.alt} width={img.width} height={img.height} className="size-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col px-[3px] pt-4">
        <h3 className="font-jakarta text-[22px]/8 font-bold tracking-[-0.01em] text-charcoal md:text-[24px]/9">{product.title}</h3>
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {tiles.map((t, i) => (
            <li key={i} className="rounded-[12px] bg-soft px-3 py-2.5">
              <p className="font-jakarta text-[16px]/6 font-semibold text-charcoal">{t.value}</p>
              {t.label && <p className="text-[11px]/4 text-muted">{t.label}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <PriceBlock product={product} small />
          <ButtonLink href={productHref(product)} className="mb-1 h-11 px-6 text-body-sm">
            View Detail
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
    <article className="relative flex h-full flex-col rounded-[32px] border border-[#ECF1F8] bg-card p-[15px] shadow-[0_6px_24px_rgb(35_42_50/0.05)]">
      <div className="relative h-[240px] overflow-hidden rounded-[24px]">
        <Image src={img.src} alt={img.alt} width={img.width} height={img.height} className="size-full object-cover object-top" />
        {product.badge && <Badge badge={product.badge} />}
      </div>
      <div className="flex flex-1 flex-col px-[3px] pt-5">
        <h3 className="font-jakarta text-[22px]/8 font-bold tracking-[-0.01em] text-charcoal md:text-[24px]/9">{product.title}</h3>
        <ul className={cn("mt-5 grid gap-2", chips.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {chips.map((c, i) => (
            <li key={i} className="flex h-9 items-center justify-center rounded-[10px] bg-[#F4F6FA] px-2 text-[11px] font-semibold text-muted">
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-8">
          <PriceBlock product={product} small />
          <ButtonLink href={productHref(product)} className="mb-1 h-11 px-7 text-body-sm" aria-label={`View ${product.title}`}>
            View
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
