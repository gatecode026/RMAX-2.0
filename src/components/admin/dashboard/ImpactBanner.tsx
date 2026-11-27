import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Footer strip with the live totals (no static marketing copy). */
export function ImpactBanner({ orders, institutions }: { orders: number; institutions: number }) {
  return (
    <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-[0_2px_12px_rgb(35_42_50/0.03)] transition-shadow hover:shadow-md sm:flex-row sm:p-6">
      <div className="text-center sm:text-left">
        <h3 className="font-jakarta text-[16.5px] font-bold text-[#202A36] sm:text-[18px]">
          {orders} {orders === 1 ? "order" : "orders"} from {institutions} {institutions === 1 ? "institution" : "institutions"} so far.
        </h3>
        <p className="mt-1 text-[13px] text-[#718096]">See the monthly breakdown in Reports.</p>
      </div>
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
