import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AdminEnquiry } from "@/lib/admin/types";

interface RecentEnquiriesListProps {
  enquiries: AdminEnquiry[];
}

export function RecentEnquiriesList({ enquiries }: RecentEnquiriesListProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-[0_2px_12px_rgb(35_42_50/0.03)] sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="font-jakarta text-[17px] font-bold text-[#202A36]">Recent Enquiries</h3>
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-1 text-[13px] font-bold text-[#10469B] hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* List items */}
      <div className="mt-3 divide-y divide-gray-100">
        {enquiries.map((e) => (
          <Link
            key={e.id}
            href="/admin/enquiries"
            className="flex items-start gap-3.5 py-3 transition hover:bg-gray-50/70 first:pt-2 last:pb-1 rounded-xl px-2"
          >
            {/* Initials Avatar */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EBF2FC] text-[13px] font-bold text-[#10469B]">
              {e.initials}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-jakarta text-[14px] font-bold text-[#202A36] truncate">
                    {e.customerName}
                  </span>
                  <span className="size-2 rounded-full bg-[#16A34A] shrink-0" aria-label="Active" />
                </div>
                <span className="text-[11px] font-medium text-[#94A3B8] shrink-0">{e.timeAgo}</span>
              </div>

              <p className="text-[12px] font-semibold text-[#10469B] truncate">{e.institution}</p>
              <p className="mt-0.5 text-[12px] text-[#718096] line-clamp-1">{e.messagePreview}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
