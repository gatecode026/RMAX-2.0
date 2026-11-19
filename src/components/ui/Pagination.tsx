"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/** Server-side pagination footer: rows-per-page, range, previous / next. */
export function Pagination({
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-[#E5EBF4] px-5 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-slate-500">
        <label htmlFor="rows-per-page">Rows per page</label>
        <select
          id="rows-per-page"
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-[#10469B] focus:outline-none"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span>
          {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page" className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-2 font-semibold text-slate-700">
          Page {page} of {totalPages}
        </span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Next page" className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
