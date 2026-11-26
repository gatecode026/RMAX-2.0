import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ProductListDTO } from "@/lib/data/content";
import { specText, type GroupCardMeta } from "@/lib/catalog";

/** Product page route for a catalogue item. */
export const productHref = (p: Pick<ProductListDTO, "slug">) => `/products/${p.slug}`;

/** Card highlights come from the product record: its own chips, else its first visible spec rows. Nothing is invented. */
function getCardSpecs(product: ProductListDTO): string[] {
  if (product.chips?.length) return product.chips.slice(0, 4);
  return (product.techSpecs ?? [])
    .filter((r) => r.visible !== false && r.label && r.value)
    .slice(0, 4)
    .map((r) => specText(r));
}

interface UnifiedProductCardProps {
  product: ProductListDTO;
  clamp?: boolean;
  imageHeight?: number;
  variant?: "home" | "listing";
}

/**
 * Pixel-accurate card matching user Figma specification and layout:
 * - Rounded 24px, #FDFDFD background, #D6DCE4 border, Figma box-shadow
 * - 310px image container with #FDFDFD badge (e.g. 50% OFF)
 * - 24px/32px Montserrat 700 title, 16px/24px Manrope 400 description
 * - 2x2 bento specs grid with #FBF9F5 40px chips
 * - Diagonal-struck MRP, bold Montserrat price, and 44px #232A32 rounded "View" button
 */
function UnifiedProductCard({
  product,
}: UnifiedProductCardProps) {
  const group = (product as { group?: GroupCardMeta }).group;
  const img = product.cardImage ?? product.image;
  const specs = group ? group.chips : getCardSpecs(product);
  const discountPercent =
    product.mrp && product.price && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  return (
    <article className="group relative flex h-full w-full flex-col justify-between rounded-[24px] border border-[#D6DCE4] bg-[#FDFDFD] p-4 shadow-[0px_18px_48px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-[0px_24px_56px_rgba(15,23,42,0.12)]">
      <div>
        {/* Product Image Frame */}
        <Link
          href={productHref(product)}
          className={`relative block aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-[#F4F2EE] isolation-auto`}
        >
          {group?.badge ? (
            <div className="absolute left-4 top-4 z-10 flex h-6 items-center justify-center rounded-[12px] bg-[#FDFDFD] px-3 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_rgba(0,0,0,0.1)]">
              <span className="font-sans text-[12px] font-extrabold leading-4 text-[#002970]">{group.badge}</span>
            </div>
          ) : discountPercent ? (
            <div className="absolute left-4 top-4 z-10 flex h-6 items-center justify-center rounded-[12px] bg-[#FDFDFD] px-3 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_rgba(0,0,0,0.1)]">
              <span className="font-sans text-[12px] font-extrabold leading-4 text-[#002970]">
                {discountPercent}% OFF
              </span>
            </div>
          ) : null}

          {img.src ? (
            // Every card uses the same 4:5 frame; the photo fills it (cover) so card heights stay equal and rows align.
            <Image
              src={img.src}
              alt={img.alt || (group ? group.title : product.title)}
              width={img.width || 400}
              height={img.height || 310}
              className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-[#F4F2EE] px-4 text-center font-heading text-[16px] font-extrabold text-[#002970]/50 tracking-wider uppercase">
              RMAX Solutions
            </div>
          )}
        </Link>

        {/* Content Frame */}
        <div className="mt-5 flex flex-col gap-4 px-1">
          {/* Title & Description Block */}
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-[24px] font-bold leading-[32px] tracking-[-1.08px] text-[#232A32] line-clamp-2">
              <Link href={productHref(product)} className="transition-colors hover:text-navy after:absolute after:inset-0 after:z-0 after:rounded-[24px] after:content-['']">
                {group ? group.title : product.title}
              </Link>
            </h3>

            <p className="font-sans text-[16px] font-normal leading-[24px] text-[#586574] line-clamp-2">
              {group && group.count > 1 ? `${group.badge} — pick the option on the next page.` : product.intro ?? product.summary ?? "For lower-volume sanitary napkin disposal in schools, offices and shared washrooms."}
            </p>
          </div>

          {/* 4 Specs Bento Grid (2x2) */}
          <div className="grid w-full grid-cols-2 gap-2">
            {/* Always 4 slots: missing specs render as empty tiles so every card keeps the same 2x2 layout. */}
            {Array.from({ length: 4 }, (_, idx) => specs[idx]).map((item, idx) => (
              <div
                key={idx}
                aria-hidden={item ? undefined : true}
                className="flex min-h-[40px] items-center rounded-[12px] bg-soft px-3 py-1.5 font-sans text-[12px] font-bold leading-4 text-[#586574]"
              >
                {item && <span className="line-clamp-2">{item}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Frame: Price & View button */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-3 px-1 pt-1">
        <div className="flex flex-col items-start justify-end">
          {product.mrp && product.mrp > product.price && product.price > 0 && product.stockStatus !== "enquiry-only" ? (
            <div className="relative inline-block font-sans text-[16px] font-normal leading-[20px] text-[#B8C4D4] -mb-0.5">
              <span className="diagonal-strike">{formatINR(product.mrp)}</span>
            </div>
          ) : null}
          {group && product.price > 0 && product.stockStatus !== "enquiry-only" ? <span className="text-[12px] font-semibold text-[#586574]">From</span> : null}
          <span
            className={cn(
              "font-heading font-bold text-[#232A32] tracking-tight",
              product.price > 0 && product.stockStatus !== "enquiry-only" ? "text-[32px] leading-[36px]" : "text-[20px] sm:text-[22px] leading-[28px]"
            )}
          >
            {product.price > 0 && product.stockStatus !== "enquiry-only" ? <>{formatINR(product.price)}<span className="ml-1 whitespace-nowrap text-[14px] font-semibold text-muted">+ GST</span></> : "Price on request"}
          </span>
        </div>

        <Link
          href={productHref(product)}
          className="relative z-10 inline-flex h-[44px] min-w-[86px] items-center justify-center rounded-[24px] bg-[#232A32] px-6 py-3 font-sans text-[16px] font-extrabold leading-[20px] text-[#FDFDFD] transition-colors hover:bg-[#002970] shrink-0 cursor-pointer"
        >
          View
        </Link>
      </div>
    </article>
  );
}

/** Photo-led card (Home "Best sellers", Listing row 1) */
export function ShowcaseCard({
  product,
  clamp = false,
  variant = "home",
  imageHeight = 320,
}: {
  product: ProductListDTO;
  clamp?: boolean;
  variant?: "home" | "listing";
  imageHeight?: number;
}) {
  return (
    <UnifiedProductCard
      product={product}
      clamp={clamp}
      variant={variant}
      imageHeight={imageHeight}
    />
  );
}

/** Card for row 2 — 100% identical and unified */
export function DetailCard({ product }: { product: ProductListDTO }) {
  return (
    <UnifiedProductCard
      product={{
        ...product,
        cardImage: product.portraitImage ?? product.image,
      }}
      clamp
    />
  );
}

/** Compact card used in "Related products" on the detail page */
export function RelatedCard({ product }: { product: ProductListDTO }) {
  return <UnifiedProductCard product={product} imageHeight={260} clamp />;
}
