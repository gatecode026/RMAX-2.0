import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { specChips } from "@/lib/home";
import { cn } from "@/lib/cn";
import type { ProductDTO } from "@/lib/data/content";

/** Product page route for a catalogue item. */
export const productHref = (p: Pick<ProductDTO, "slug">) => `/products/${p.slug}`;

interface UnifiedProductCardProps {
  product: ProductDTO;
  clamp?: boolean;
  imageHeight?: number;
  variant?: "home" | "listing";
}

function UnifiedProductCard({
  product,
  clamp = false,
  imageHeight,
  variant,
}: UnifiedProductCardProps) {
  const img =
    (variant === "listing" ? product.listImage : undefined) ??
    product.cardImage ??
    product.image;

  const chips = product.chips ?? specChips(product.specs);
  const hasOriginal = product.originalPrice > product.price;

  return (
    <article className="group relative flex h-full flex-col rounded-[28px] border border-[#E2E8F0] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_16px_36px_rgba(0,41,112,0.08)]">
      {/* Product Image Container */}
      <div
        className="relative w-full overflow-hidden rounded-[20px] bg-gradient-to-b from-[#eaf0f8] to-[#f4f7fb] flex items-center justify-center"
        style={{ height: imageHeight || 320 }}
      >
        <Image
          src={img.src}
          alt={img.alt || product.title}
          width={img.width || 400}
          height={img.height || 340}
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {product.badge && (
          <span className="absolute top-3.5 left-3.5 z-10 inline-flex items-center rounded-full bg-[#0B254E] px-3.5 py-1.5 text-[11px] font-extrabold tracking-wider text-white uppercase shadow-xs">
            {product.badge.label}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="mt-5 flex flex-1 flex-col">
        {/* Product Title */}
        <h3 className="font-jakarta text-[22px] font-bold leading-tight tracking-tight text-[#1e293b]">
          <Link href={productHref(product)} className="hover:text-navy transition-colors">
            {product.title}
          </Link>
        </h3>

        {/* Product Subtitle / Summary */}
        {product.summary && (
          <p className={cn("mt-2 text-[14px] leading-relaxed text-[#64748b]", clamp && "line-clamp-2")}>
            {product.summary}
          </p>
        )}

        {/* 2x2 Specs Grid */}
        <ul className="mt-4 grid grid-cols-2 gap-2.5">
          {chips.slice(0, 4).map((c, i) => (
            <li
              key={i}
              className="flex h-10 items-center rounded-[12px] bg-[#EAF0F8] px-3.5 text-[13px] font-semibold text-[#475569] truncate"
            >
              {c}
            </li>
          ))}
        </ul>

        {/* Price & Action Button Footer */}
        <div className="mt-6 flex items-end justify-between gap-3 pt-1">
          <div>
            {hasOriginal && (
              <p className="text-[14px] font-normal text-[#94a3b8] line-through leading-none mb-1.5">
                <span className="sr-only">Original price </span>
                {formatINR(product.originalPrice)}
              </p>
            )}
            <p className="font-jakarta text-[30px] md:text-[32px] font-extrabold text-[#1e293b] leading-none tracking-tight">
              {formatINR(product.price)}
            </p>
          </div>

          <Link
            href={productHref(product)}
            className="inline-flex items-center justify-center rounded-full bg-[#202630] hover:bg-[#0B254E] px-7 py-2.5 text-[14px] font-bold text-white shadow-xs transition-colors"
            aria-label={`View ${product.title}`}
          >
            View
          </Link>
        </div>
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
  product: ProductDTO;
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

/** Spec-tile card (Listing row 2) */
export function DetailCard({ product }: { product: ProductDTO }) {
  return <UnifiedProductCard product={product} imageHeight={320} />;
}

/** Compact card used in "Related products" on the detail page */
export function RelatedCard({ product }: { product: ProductDTO }) {
  return <UnifiedProductCard product={product} imageHeight={260} clamp />;
}
