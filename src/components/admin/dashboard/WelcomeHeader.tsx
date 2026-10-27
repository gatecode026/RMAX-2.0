"use client";

import { useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";

export function WelcomeHeader({
  userName = "Rahul",
  dateRange = "01 Oct 2026 - 31 Oct 2026",
}: {
  userName?: string;
  dateRange?: string;
}) {
  const [selectedRange, setSelectedRange] = useState(dateRange);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const ranges = [
    "Today",
    "Last 7 Days",
    "01 Oct 2026 - 31 Oct 2026",
    "Last 3 Months",
    "Year to Date (2026)",
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-jakarta text-[26px]/8 font-bold tracking-[-0.015em] text-[#202A36] sm:text-[28px]/9">
          Welcome back, {userName} 👋
        </h1>
        <p className="mt-1 text-[14px] text-[#718096]">
          Here&apos;s what&apos;s happening with RMAX today.
        </p>
      </div>

      {/* Date Range Selector Pill */}
      <div className="relative self-start sm:self-auto">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex h-[42px] items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white px-4 text-[13px] font-semibold text-[#202A36] shadow-xs transition hover:bg-gray-50 active:scale-98"
          aria-expanded={dropdownOpen}
          aria-label="Select date range"
        >
          <Calendar className="size-4 text-[#718096]" />
          <span>{selectedRange}</span>
          <ChevronDown className="size-3.5 text-[#718096]" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-[48px] z-30 w-[240px] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
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
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] font-medium text-gray-700 hover:bg-[#F4F7FC] hover:text-[#10469B]"
                >
                  <span>{r}</span>
                  {selectedRange === r && <Check className="size-4 text-[#10469B]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
