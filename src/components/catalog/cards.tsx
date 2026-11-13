import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ProductDTO } from "@/lib/data/content";

/** Product page route for a catalogue item. */
export const productHref = (p: Pick<ProductDTO, "slug">) => `/products/${p.slug}`;

function getCardSpecs(product: ProductDTO): string[] {
  const slug = (product.slug || "").toLowerCase();
  const s = product.specs;

  if (slug.includes("basic") || slug === "sanitary-pad-disposal-machine-100-pad") {
    return ["800 W", "8kg", "80–100 / day", "Blue / Pink"];
  }
  if (slug === "sanitary-pad-disposal-machine") {
    return ["1200 W", "14kg", "150–200 / day", "Blue / Off-White"];
  }
  if (slug === "sanitary-pad-disposal-machine-500-pad") {
    return ["2000 W", "28kg", "500 / day", "Commercial MS"];
  }
  if (slug === "30-pad-sanitary-napkin-vending-machine") {
    return ["30-Pad Capacity", "Coin Operated", "Wall Mount", "1 Year Warranty"];
  }
  if (slug === "50-pad-sanitary-napkin-vending-machine") {
    return ["50-Pad Capacity", "Designer Front", "Wall Mount", "1 Year Warranty"];
  }
  if (slug === "100-pad-sanitary-napkin-vending-machine") {
    return ["100-Pad Capacity", "Steel Body", "Wall Mount", "1 Year Warranty"];
  }
  if (slug === "automatic-sanitary-napkin-vending-machine") {
    return ["50-Pad Capacity", "Digital LCD", "Automatic", "1 Year Warranty"];
  }
  if (slug === "push-button-sanitary-napkin-vending-machine") {
    return ["50-Pad Capacity", "Push Button", "Free Dispense", "Wall Mount"];
  }
  if (slug === "baby-diaper-vending-machine") {
    return ["Multi-Coin Mech", "Wall Mount", "Dual Column", "1 Year Warranty"];
  }
  if (slug === "cloth-bag-vending-machine") {
    return ["Cloth Bag Dispense", "Coin / Token", "Floor / Wall", "1 Year Warranty"];
  }
  if (slug === "dust-remover-machine") {
    return ["10–15 HP Motor", "120–200 kg/hr", "915 mm Drum", "Blender Rotor"];
  }
  if (slug === "plastic-waste-shredder-machine") {
    return ["10 HP Motor", "1 Tonne/day", "4+2 Blades", "300 kg Scale"];
  }
  if (slug === "plastic-bailing-machine") {
    return ["7.5 HP Motor", "50–60 kg Bale", "Hydraulic MS", "1 Year Warranty"];
  }
  if (slug === "complete-pwmu-setup") {
    return ["Turnkey Setup", "PWMU Compliant", "Pan-India Setup", "End-to-End"];
  }
  if (slug === "plastic-bottle-crusher-machine") {
    return ["Reverse Vending", "Heavy Duty", "Auto Compaction", "Commercial"];
  }
  if (slug === "wet-dry-dustbins") {
    return ["Dual Segregation", "Wet & Dry", "UV Stabilized", "Heavy Duty"];
  }
  if (slug === "wheelbarrows") {
    return ["Heavy-Duty Steel", "Pneumatic Wheel", "Ergonomic Handles", "High Capacity"];
  }
  if (slug === "mobile-toilets") {
    return ["FRP Structure", "Ventilated", "Easy Relocation", "Water Tank Opt."];
  }
  if (slug === "composting-machine") {
    return ["Organic Waste", "Aerobic Digestion", "Odor Free", "Fast Cycle"];
  }
  if (slug === "toilet-feedback-machine") {
    return ["3-Button IoT", "Real-Time Cloud", "GSM / Wi-Fi", "Battery / USB"];
  }
  if (slug === "gps-trackers") {
    return ["Live Tracking", "Geofencing", "SOS Alert", "Multi-Vehicle"];
  }
  if (slug === "usb-gps-receiver") {
    return ["USB Interface", "Plug & Play", "High Sensitivity", "Universal OS"];
  }
  if (slug === "max-can-obd-scanner") {
    return ["OBD-II CAN-Bus", "Diagnostics", "Live Telemetry", "Heavy Vehicles"];
  }
  if (slug === "led-advertisement-screens") {
    return ["High Brightness", "Daylight Visible", "Weatherproof", "Cloud CMS"];
  }
  if (slug === "smart-iot-sensors") {
    return ["Multi-Sensor", "Low Power IoT", "Cloud Alerts", "Plug & Play"];
  }
  if (slug === "home-automation-solutions") {
    return ["Smart Switch/App", "Voice Assistant", "Energy Monitor", "Retrofit"];
  }

  const res: string[] = [];
  if (s?.power && s.power !== "Not specified") res.push(s.power);
  if (s?.weight && s.weight !== "Not specified") res.push(s.weight);
  if (s?.dailyCapacity && s.dailyCapacity !== "Not specified") res.push(s.dailyCapacity);
  if (s?.colours && s.colours !== "Not specified") res.push(s.colours);

  while (res.length < 4) {
    if (res.length === 0) res.push("In-House Made");
    else if (res.length === 1) res.push("1 Year Warranty");
    else if (res.length === 2) res.push("PAN India");
    else res.push("RMAX Certified");
  }
  return res.slice(0, 4);
}

interface UnifiedProductCardProps {
  product: ProductDTO;
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
  const img = product.cardImage ?? product.image;
  const specs = getCardSpecs(product);
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
          className="relative block h-[310px] w-full overflow-hidden rounded-[16px] bg-[#F4F2EE] isolation-auto"
        >
          {discountPercent ? (
            <div className="absolute left-4 top-4 z-10 flex h-6 items-center justify-center rounded-[12px] bg-[#FDFDFD] px-3 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_rgba(0,0,0,0.1)]">
              <span className="font-sans text-[12px] font-extrabold leading-4 text-[#002970]">
                {discountPercent}% OFF
              </span>
            </div>
          ) : null}

          {img.src ? (
            <Image
              src={img.src}
              alt={img.alt || product.title}
              width={img.width || 400}
              height={img.height || 310}
              unoptimized={img.src.startsWith("http")}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
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
            <h3 className="font-heading text-[24px] font-bold leading-[32px] tracking-[-1.08px] text-[#232A32] line-clamp-2 min-h-[64px]">
              <Link href={productHref(product)} className="hover:text-navy transition-colors">
                {product.title}
              </Link>
            </h3>

            <p className="font-sans text-[16px] font-normal leading-[24px] text-[#586574] line-clamp-2 min-h-[48px]">
              {product.intro ?? product.summary ?? "For lower-volume sanitary napkin disposal in schools, offices and shared washrooms."}
            </p>
          </div>

          {/* 4 Specs Bento Grid (2x2) */}
          <div className="grid grid-cols-2 gap-2 h-[88px] w-full">
            {specs.map((item, idx) => (
              <div
                key={idx}
                className="flex h-[40px] items-center rounded-[8px] bg-[#FBF9F5] px-3 font-sans text-[12px] font-bold leading-[20px] text-[#586574] truncate"
              >
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Frame: Price & View button */}
      <div className="mt-4 flex items-end justify-between gap-3 px-1 pt-1">
        <div className="flex flex-col items-start justify-end">
          {product.mrp && product.mrp > product.price && product.price > 0 ? (
            <div className="relative inline-block font-sans text-[16px] font-normal leading-[20px] text-[#B8C4D4] -mb-0.5">
              <span className="diagonal-strike">{formatINR(product.mrp)}</span>
            </div>
          ) : null}
          <span
            className={cn(
              "font-heading font-bold text-[#232A32] tracking-tight",
              product.price > 0 ? "text-[32px] leading-[36px]" : "text-[20px] sm:text-[22px] leading-[28px]"
            )}
          >
            {product.price > 0 ? formatINR(product.price) : "Price on request"}
          </span>
        </div>

        <Link
          href={productHref(product)}
          className="inline-flex h-[44px] min-w-[86px] items-center justify-center rounded-[24px] bg-[#232A32] px-6 py-3 font-sans text-[16px] font-extrabold leading-[20px] text-[#FDFDFD] transition-colors hover:bg-[#002970] shrink-0 cursor-pointer"
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

/** Card for row 2 — 100% identical and unified */
export function DetailCard({ product }: { product: ProductDTO }) {
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
export function RelatedCard({ product }: { product: ProductDTO }) {
  return <UnifiedProductCard product={product} imageHeight={260} clamp />;
}
