"use client";

import { useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";

export function WelcomeHeader({
  userName = "Administrator",
  dateRange,
}: {
  userName?: string;
  dateRange?: string;
}) {
  // Only show the clean name, strip out any role or parentheses (e.g. "(Super Admin & Manager)")
  const cleanName = (userName || "Administrator")
    .replace(/\s*\(.*?\)/g, "")
    .replace(/\s*-\s*(Super Admin|Admin|Manager).*/i, "")
    .trim();

  const now = new Date();
  const monthShort = now.toLocaleDateString("en-GB", { month: "short" });
  const year = now.getFullYear();
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const defaultRange = `01 ${monthShort} - ${lastDay} ${monthShort} ${year}`;
  const effectiveRange = dateRange || defaultRange;

  const [selectedRange, setSelectedRange] = useState(effectiveRange);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const ranges = [
    "Today",
    "Last 7 Days",
    `01 ${monthShort} - ${lastDay} ${monthShort} ${year}`,
    "Last 3 Months",
    `Year to Date (${year})`,
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-jakarta text-[26px]/8 font-bold tracking-[-0.015em] text-[#202A36] sm:text-[28px]/9">
          Welcome back, {cleanName} 👋
        </h1>
        <p className="mt-1 text-[14px] text-[#718096]">
          Here&apos;s what&apos;s happening with RMAX today.
        </p>
      </div>

      {/* Date Range Selector Pill - Fixed single line, no wrapping */}
      <div className="relative self-start sm:self-auto shrink-0">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex h-[42px] shrink-0 whitespace-nowrap items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-[13px] font-semibold text-[#202A36] shadow-xs transition hover:bg-gray-50 active:scale-98 cursor-pointer select-none"
          aria-expanded={dropdownOpen}
          aria-label="Select date range"
        >
          <Calendar className="size-4 shrink-0 text-[#718096]" />
          <span className="whitespace-nowrap">{selectedRange}</span>
          <ChevronDown className="size-3.5 shrink-0 text-[#718096]" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-[48px] z-30 min-w-[220px] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
            <p className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Filter By Period
            </p>
            <div className="mt-1 space-y-0.5">
              {ranges.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRange(r);
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-[#F4F7FC] hover:text-[#10469B] whitespace-nowrap gap-3 cursor-pointer"
                >
                  <span>{r}</span>
                  {selectedRange === r && <Check className="size-4 text-[#10469B] shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
