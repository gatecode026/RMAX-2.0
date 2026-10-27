import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function ImpactBanner() {
  return (
    <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-[0_2px_12px_rgb(35_42_50/0.03)] sm:flex-row sm:p-6 transition-shadow hover:shadow-md">
      {/* Left: Machine image and text */}
      <div className="flex flex-col items-center gap-5 sm:flex-row text-center sm:text-left">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-[#F4F7FC] p-1.5 shadow-xs">
          <Image
            src="/images/products/list-pro-max.png"
            alt="RMAX Hygiene Machine"
            fill
            className="object-contain p-0.5"
            sizes="64px"
          />
        </div>

        <div>
          <h3 className="font-jakarta text-[16.5px] font-bold text-[#202A36] sm:text-[18px]">
            Help institutions build a cleaner, healthier tomorrow.
          </h3>
          <p className="mt-1 text-[13px] text-[#718096]">
            Track your impact &mdash; more institutions, cleaner campuses, safer communities.
          </p>
        </div>
      </div>

      {/* Right: View Reports CTA */}
      <Link
        href="/admin/reports"
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0B2450] px-6 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#10469B] active:scale-98"
      >
        <span>View Reports</span>
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
