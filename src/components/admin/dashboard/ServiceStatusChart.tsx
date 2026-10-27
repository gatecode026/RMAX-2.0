import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServiceSummary } from "@/lib/admin/types";

interface ServiceStatusChartProps {
  summary: ServiceSummary;
}

export function ServiceStatusChart({ summary }: ServiceStatusChartProps) {
  const total = summary.total || 42;

  // Donut chart math: 80x80 viewBox
  const radius = 30;
  const circumference = 2 * Math.PI * radius; // ~188.5

  const completedPct = summary.completed / total;
  const inProgressPct = summary.inProgress / total;
  const scheduledPct = summary.scheduled / total;
  const pendingPct = summary.pending / total;

  const strokeCompleted = completedPct * circumference;
  const strokeInProgress = inProgressPct * circumference;
  const strokeScheduled = scheduledPct * circumference;
  const strokePending = pendingPct * circumference;

  const offsetCompleted = 0;
  const offsetInProgress = -strokeCompleted;
  const offsetScheduled = -(strokeCompleted + strokeInProgress);
  const offsetPending = -(strokeCompleted + strokeInProgress + strokeScheduled);

  const legendItems = [
    { label: "Completed", value: summary.completed, color: "#16A34A" },
    { label: "In Progress", value: summary.inProgress, color: "#0284C7" },
    { label: "Scheduled", value: summary.scheduled, color: "#F59E0B" },
    { label: "Pending", value: summary.pending, color: "#DC2626" },
  ];

  return (
    <div className="flex flex-col rounded-2xl border border-[#E5EBF4] bg-white p-4.5 sm:p-5 shadow-[0_2px_12px_rgb(35_42_50/0.03)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <h3 className="font-jakarta text-[15px] font-bold text-[#202A36] leading-tight">
          Service & Installation
        </h3>
        <Link
          href="/admin/service-requests"
          className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-[#10469B] hover:underline whitespace-nowrap"
        >
          <span>View All</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Donut Chart & Legend Side-by-Side */}
      <div className="mt-3.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Donut Chart Container (80px) */}
        <div className="relative flex size-20 shrink-0 items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 80 80">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="9"
            />
            {/* Completed Segment (Green) */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="#16A34A"
              strokeWidth="9"
              strokeDasharray={`${strokeCompleted} ${circumference}`}
              strokeDashoffset={offsetCompleted}
              className="transition-all duration-500"
            />
            {/* In Progress Segment (Blue) */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="#0284C7"
              strokeWidth="9"
              strokeDasharray={`${strokeInProgress} ${circumference}`}
              strokeDashoffset={offsetInProgress}
              className="transition-all duration-500"
            />
            {/* Scheduled Segment (Amber) */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="#F59E0B"
              strokeWidth="9"
              strokeDasharray={`${strokeScheduled} ${circumference}`}
              strokeDashoffset={offsetScheduled}
              className="transition-all duration-500"
            />
            {/* Pending Segment (Red) */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="#DC2626"
              strokeWidth="9"
              strokeDasharray={`${strokePending} ${circumference}`}
              strokeDashoffset={offsetPending}
              className="transition-all duration-500"
            />
          </svg>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-jakarta text-[18px] font-extrabold text-[#202A36] leading-none">
              {total}
            </span>
            <span className="mt-0.5 text-[9px] font-semibold text-[#718096] leading-none">
              This Month
            </span>
          </div>
        </div>

        {/* Legend: Clean Spacing and Alignment */}
        <div className="min-w-0 flex-1 space-y-2">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-[12px] leading-tight">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-slate-700 font-medium">
                  {item.label}
                </span>
              </div>
              <span className="shrink-0 font-bold text-slate-900 tabular-nums pl-2">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
