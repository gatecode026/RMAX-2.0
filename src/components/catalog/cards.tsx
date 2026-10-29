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

  // The official catalogue/listing images already have the badges baked into the pixels.
  // We only render an HTML overlay badge if the image does NOT have one baked in.
  const isBakedImage =
    img.src.includes("list-") ||
    img.src.includes("card-") ||
    img.src.includes("testimonial-");

  return (
    <article className="group relative flex h-full flex-col rounded-[24px] sm:rounded-[28px] border border-line bg-card p-3 sm:p-3.5 xl:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-[0_16px_36px_rgba(0,41,112,0.08)]">
      {/* Product Image Container */}
      <div
        className="relative w-full overflow-hidden rounded-[16px] sm:rounded-[20px] bg-gradient-to-b from-[#eaf0f8] to-[#f4f7fb] flex items-center justify-center h-[200px] sm:h-[220px] lg:h-[260px] xl:h-[300px]"
      >
        <Image
          src={img.src}
          alt={img.alt || product.title}
          width={img.width || 400}
          height={img.height || 340}
          className="size-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {!isBakedImage && product.badge && (
          <span
            className={cn(
              "absolute top-3.5 left-3.5 z-10 inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-extrabold tracking-wider uppercase shadow-xs",
              product.badge.tone === "light"
                ? "bg-white text-navy border border-line/50 font-bold"
                : product.badge.tone === "green"
                ? "bg-[#257052] text-white"
                : "bg-navy text-white"
            )}
          >
            {product.badge.label}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="mt-3.5 sm:mt-4 flex flex-1 flex-col justify-between">
        <div>
          {/* Product Title */}
          <h3 className="font-heading text-[15px] sm:text-[16px] lg:text-[18px] xl:text-[20px] font-extrabold leading-tight tracking-[-0.3px] text-charcoal">
            <Link href={productHref(product)} className="hover:text-navy transition-colors">
              {product.title}
            </Link>
          </h3>

          {/* Product Subtitle / Summary */}
          {product.summary && (
            <p className={cn("mt-1.5 sm:mt-2 text-[12px] sm:text-[13px] leading-relaxed text-muted", clamp && "line-clamp-2")}>
              {product.summary}
            </p>
          )}

          {/* 2x2 Specs Grid */}
          <ul className="mt-3 sm:mt-4 grid grid-cols-2 gap-1.5 sm:gap-2">
            {chips.slice(0, 4).map((c, i) => (
              <li
                key={i}
                className="flex h-7.5 sm:h-8.5 items-center justify-center rounded-[8px] sm:rounded-[10px] bg-soft px-1 sm:px-2 text-[10px] sm:text-[11px] xl:text-[12.5px] font-semibold text-muted whitespace-nowrap text-center"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Price & Action Button Footer */}
        <div className="mt-4 sm:mt-5 flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            {hasOriginal && (
              <p className="text-[11px] sm:text-[12px] font-normal text-muted-dark line-through leading-none mb-1 truncate">
                <span className="sr-only">Original price </span>
                {formatINR(product.originalPrice)}
              </p>
            )}
            <p className="font-heading text-[18px] sm:text-[20px] lg:text-[24px] xl:text-[28px] font-extrabold text-charcoal leading-none tracking-tight">
              {formatINR(product.price)}
            </p>
          </div>

          <Link
            href={productHref(product)}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-charcoal hover:bg-navy px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] xl:text-[14px] font-bold text-white shadow-xs transition-colors"
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

/** Spec-tile card (Listing row 2 matching Figma exactly) */
export function DetailCard({ product }: { product: ProductDTO }) {
  const img = product.portraitImage ?? product.image;
  const hasOriginal = product.originalPrice > product.price;

  const isBasic = product.slug === "basic";
  const fourthValue =
    isBasic || !product.specs.batchCapacity || product.specs.batchCapacity === "Not specified"
      ? product.specs.colours === "See supplied image"
        ? "Blue / Pink"
        : product.specs.colours
      : product.specs.batchCapacity;
  const fourthLabel =
    isBasic || !product.specs.batchCapacity || product.specs.batchCapacity === "Not specified"
      ? "Colours"
      : "Batch capacity";

  const hyphen = (s: string) => s.replace(/–/g, "-");

  const tiles = [
    { value: hyphen(product.specs.power), label: "Power" },
    { value: hyphen(product.specs.weight), label: "Weight" },
    { value: hyphen(product.specs.dailyCapacity), label: "Daily capacity" },
    { value: hyphen(fourthValue), label: fourthLabel },
  ];

  return (
    <article className="group relative flex h-full flex-col rounded-[24px] sm:rounded-[28px] border border-line bg-card p-3 sm:p-3.5 xl:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-[0_16px_36px_rgba(0,41,112,0.08)]">
      {/* Product Image Container */}
      <div
        className="relative w-full overflow-hidden rounded-[16px] sm:rounded-[20px] bg-gradient-to-b from-[#eaf0f8] to-[#f4f7fb] flex items-center justify-center h-[220px] sm:h-[250px] lg:h-[260px] xl:h-[300px]"
      >
        <Image
          src={img.src}
          alt={img.alt || product.title}
          width={img.width || 400}
          height={img.height || 340}
          className="size-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {/* Card Content */}
      <div className="mt-3.5 sm:mt-4 flex flex-1 flex-col justify-between">
        <div>
          {/* Product Title */}
          <h3 className="font-heading text-[16px] sm:text-[18px] xl:text-[20px] font-extrabold leading-tight tracking-[-0.3px] text-charcoal">
            <Link href={productHref(product)} className="hover:text-navy transition-colors">
              {product.title}
            </Link>
          </h3>

          {/* 2x2 Specs Grid with 2 lines each (value + label) */}
          <div className="mt-3.5 sm:mt-4 grid grid-cols-2 gap-1.5 sm:gap-2">
            {tiles.map((tile, i) => (
              <div
                key={i}
                className="flex flex-col justify-center rounded-[10px] sm:rounded-[12px] bg-[#EBF1F7] px-2 py-1.5 sm:px-2.5 sm:py-2 min-w-0"
              >
                <span className="font-heading text-[11px] sm:text-[12px] xl:text-[13px] font-bold text-charcoal leading-tight whitespace-nowrap">
                  {tile.value}
                </span>
                <span className="text-[9.5px] sm:text-[10px] xl:text-[11px] text-muted leading-tight mt-0.5 whitespace-nowrap">
                  {tile.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Action Button Footer */}
        <div className="mt-4 sm:mt-5 flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            {hasOriginal && (
              <p className="text-[11px] sm:text-[12px] font-normal text-muted-dark line-through leading-none mb-1 truncate">
                <span className="sr-only">Original price </span>
                {formatINR(product.originalPrice)}
              </p>
            )}
            <p className="font-heading text-[20px] sm:text-[24px] xl:text-[28px] font-extrabold text-charcoal leading-none tracking-tight">
              {formatINR(product.price)}
            </p>
          </div>

          <Link
            href={productHref(product)}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#18427F] hover:bg-[#002970] px-3.5 sm:px-4 xl:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] xl:text-[14px] font-bold text-white shadow-xs transition-colors"
            aria-label={`View Detail for ${product.title}`}
          >
            View Detail
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Compact card used in "Related products" on the detail page */
export function RelatedCard({ product }: { product: ProductDTO }) {
  return <UnifiedProductCard product={product} imageHeight={260} clamp />;
}
