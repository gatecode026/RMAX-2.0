"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PickerGroup } from "@/lib/catalog";

export interface VariantOption {
  label: string;
  active: boolean;
  slug?: string;
  value?: string;
  disabled?: boolean;
}
export interface VariantGroup {
  title: string;
  options: VariantOption[];
}

/** Dropdown row ("Model:" ▾ / "Capacity:" ▾ / "Type:" ▾), with clean model & capacity labels, no price in dropdown */
export function TypeDropdown({ group, label, onPick }: { group: VariantGroup; label: string; onPick: (o: VariantOption) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = group.options.find((o) => o.active) ?? group.options[0];

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="flex items-center justify-between gap-3">
      <span id={`${group.title}-label`} className="text-body-sm font-medium text-charcoal">
        {label}
      </span>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${group.title}-label`}
          className="flex h-9 min-w-[180px] sm:min-w-[200px] cursor-pointer items-center justify-between rounded-[10px] border border-line bg-card px-3 text-body-sm font-semibold text-charcoal shadow-xs transition-colors hover:border-navy focus:border-navy focus:outline-none"
        >
          <span className="truncate pr-1">{active?.label}</span>
          <ChevronDown className={cn("ml-2 size-4 shrink-0 text-charcoal transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
        </button>
        {open && (
          <div
            role="listbox"
            className="absolute right-0 top-full z-40 mt-1.5 min-w-[230px] overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
          >
            {group.options.map((o) => (
              <div
                key={o.label}
                role="option"
                aria-selected={o.active}
                aria-disabled={o.disabled || undefined}
                onClick={() => {
                  setOpen(false);
                  if (!o.active && !o.disabled) onPick(o);
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-[8px] px-3 py-2 text-[13px] font-semibold transition-colors",
                  o.active ? "bg-[#EFF6FF] font-bold text-navy" : o.disabled ? "cursor-not-allowed text-muted-dark" : "text-[#0F172A] hover:bg-[#F8FAFC] hover:text-navy",
                )}
              >
                <span>{o.label}</span>
                {o.active && <Check className="ml-2 size-4 shrink-0 text-navy" aria-hidden="true" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * One dropdown per family option (Size/Model, Operation/Type, Capacity…), built from the database. Picking a value
 * opens the product for that combination; values no published product has are disabled.
 * Uses clean dropdowns showing model and capacity with NO prices.
 */
export function VariantPicker({ groups, onModel, className }: { groups: PickerGroup[]; onModel: (slug: string) => void; className?: string }) {
  if (!groups.length) return null;
  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      {groups.map((g) => (
        <TypeDropdown
          key={g.key}
          group={{
            title: g.key,
            options: g.options.map((o) => ({
              label: o.label,
              active: o.active,
              slug: o.slug ?? undefined,
              disabled: o.slug === null,
            })),
          }}
          label={`${g.label}:`}
          onPick={(o) => o.slug && onModel(o.slug)}
        />
      ))}
    </div>
  );
}
