import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import type { ServiceSummary } from "@/lib/admin/types";

interface ServiceStatusChartProps {
  summary: ServiceSummary;
}

/** Donut + status tiles. Tiles are a 2×2 grid so labels are never truncated, at any card width. */
export function ServiceStatusChart({ summary }: ServiceStatusChartProps) {
  const total = summary?.total ?? 0;

  const items = [
    { label: "Completed", value: summary?.completed || 0, color: "#16A34A", soft: "#F0FDF4" },
    { label: "In Progress", value: summary?.inProgress || 0, color: "#0284C7", soft: "#F0F9FF" },
    { label: "Scheduled", value: summary?.scheduled || 0, color: "#F59E0B", soft: "#FFFBEB" },
    { label: "Pending", value: summary?.pending || 0, color: "#DC2626", soft: "#FEF2F2" },
  ];

  // Donut: 100x100 viewBox, segments laid end to end.
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let consumed = 0;
  const segments = items.map((item) => {
    const length = total > 0 ? (item.value / total) * circumference : 0;
    const seg = { ...item, length, offset: -consumed };
    consumed += length;
    return seg;
  });

  return (
    <div className="flex flex-col rounded-2xl border border-[#E5EBF4] bg-white p-5 shadow-[0_2px_12px_rgb(35_42_50/0.03)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#10469B]/10 text-[#10469B]">
            <Wrench className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="font-jakarta text-[15px] font-bold leading-tight text-[#202A36]">Service &amp; Installation</h3>
            <p className="text-[11px] font-medium text-[#718096]">This month</p>
          </div>
        </div>
        <Link
          href="/admin/service-requests"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-bold text-[#10469B] transition hover:bg-[#10469B]/5"
        >
          View all <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>

      {/* Donut */}
      <div className="mt-5 flex justify-center">
        <div className="relative size-[132px]">
          <svg className="size-full -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`${total} service requests this month`}>
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#EEF2F7" strokeWidth="11" />
            {segments.map(
              (s) =>
                s.length > 0 && (
                  <circle
                    key={s.label}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="11"
                    strokeLinecap="butt"
                    strokeDasharray={`${s.length} ${circumference}`}
                    strokeDashoffset={s.offset}
                    className="transition-all duration-500"
                  />
                ),
            )}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-jakarta text-[30px] font-extrabold leading-none tabular-nums text-[#202A36]">{total}</span>
            <span className="mt-1 text-[11px] font-semibold text-[#718096]">{total === 1 ? "request" : "requests"}</span>
          </div>
        </div>
      </div>

      {total === 0 && <p className="mt-3 text-center text-[12px] text-[#718096]">No service requests yet this month.</p>}

      {/* Status tiles */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.label} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: item.soft }}>
              <div className="flex items-center gap-1.5">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
                <span className="text-[11.5px] font-semibold text-slate-600">{item.label}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-jakarta text-[20px] font-extrabold leading-none tabular-nums text-[#202A36]">{item.value}</span>
                {total > 0 && <span className="text-[11px] font-semibold tabular-nums text-slate-400">{pct}%</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
