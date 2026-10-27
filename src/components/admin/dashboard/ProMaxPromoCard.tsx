import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function ProMaxPromoCard() {
  return (
    <div className="relative flex min-h-[175px] w-full items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-[#143E82] via-[#1A4E9E] to-[#16448D] p-5 sm:p-6 text-white shadow-[0_4px_20px_rgb(16_70_155/0.18)]">
      {/* Decorative ambient glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 rounded-full bg-blue-400/25 blur-2xl" />

      {/* Left Column: Text & CTA */}
      <div className="relative z-10 flex max-w-[62%] sm:max-w-[65%] flex-col justify-center">
        <h3 className="font-jakarta text-[17px] sm:text-[19px] font-extrabold leading-[1.2] text-white tracking-tight">
          <span className="whitespace-nowrap">Pro-Max</span>
          <br />
          <span>Incinerator</span>
        </h3>

        <p className="mt-1 text-[11px] sm:text-[11.5px] leading-snug text-blue-100/90 font-medium">
          High-capacity solution for large institutions.
        </p>

        <div className="mt-3.5 sm:mt-4">
          <Link
            href="/admin/products/pro-max"
            className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-[#103E85] shadow-md transition-all duration-150 hover:bg-slate-100 active:scale-95"
          >
            <span>View Product</span>
            <ArrowRight className="size-3 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* Right Column: High Quality Clean Machine Image blended seamlessly */}
      <div 
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-[50%] overflow-hidden flex items-end justify-end"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 18%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 18%)"
        }}
      >
        <div className="relative h-full w-full">
          <Image
            src="/images/dashboard/promax-machine-hq.png"
            alt="RMAX Pro-Max Sanitary Incinerator"
            fill
            className="object-contain object-right-bottom p-1 drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
            sizes="(max-width: 768px) 160px, 200px"
            priority
          />
        </div>
      </div>
    </div>
  );
}

