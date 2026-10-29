"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Check, SlidersHorizontal, AlertCircle } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { ProductDTO } from "@/lib/data/content";
import { cn } from "@/lib/cn";

interface CompareModalProps {
  products: ProductDTO[];
  selectedSlugs: string[];
  isOpen: boolean;
  onClose: () => void;
  onApply?: (slugs: string[]) => void;
}

export function CompareModal({
  products,
  selectedSlugs: initialSelected,
  isOpen,
  onClose,
  onApply,
}: CompareModalProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [warning, setWarning] = useState<string | null>(null);

  // Sync with prop when opened
  useEffect(() => {
    if (isOpen) {
      setSelected(initialSelected.length > 0 ? initialSelected : ["basic", "pro", "pro-max"]);
      setWarning(null);
    }
  }, [isOpen, initialSelected]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleProduct = (slug: string) => {
    setWarning(null);
    if (selected.includes(slug)) {
      if (selected.length === 1) {
        setWarning("Please keep at least 1 product selected for comparison.");
        return;
      }
      setSelected(selected.filter((s) => s !== slug));
    } else {
      if (selected.length >= 3) {
        setWarning("You can compare a maximum of 3 products at a time. Please uncheck one model to select another.");
        return;
      }
      setSelected([...selected, slug]);
    }
  };

  const handleApply = () => {
    if (selected.length === 0) {
      setWarning("Please select at least 1 product to compare.");
      return;
    }
    if (onApply) {
      onApply(selected);
    } else {
      router.push(`/compare-models?models=${selected.join(",")}`);
    }
    onClose();
  };

  const selectAllIncinerators = () => {
    const incSlugs = products.filter((p) => p.category === "incinerator").map((p) => p.slug).slice(0, 3);
    setSelected(incSlugs);
    setWarning(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      <div
        className="relative flex flex-col w-full max-w-[680px] max-h-[90vh] bg-white rounded-[24px] sm:rounded-[32px] border border-line shadow-[0_20px_50px_rgba(0,41,112,0.18)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-line bg-gradient-to-b from-[#F4F8FC] to-white">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-navy/10 text-navy">
                <SlidersHorizontal className="size-4" />
              </span>
              <h2 id="compare-modal-title" className="font-heading text-[20px] sm:text-[22px] font-extrabold text-charcoal">
                Select Models to Compare
              </h2>
            </div>
            <p className="mt-1 text-[13px] sm:text-[14px] text-muted">
              Choose up to 3 products to compare capacity, specs and pricing side-by-side.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-soft text-charcoal hover:bg-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Counter & Warning Banner */}
        <div className="px-5 sm:px-6 pt-4 pb-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-charcoal">Selected:</span>
            <span
              className={cn(
                "inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-extrabold shadow-2xs",
                selected.length === 3
                  ? "bg-navy text-white"
                  : selected.length > 0
                  ? "bg-[#EAF0F8] text-navy border border-navy/20"
                  : "bg-red-100 text-red-700"
              )}
            >
              {selected.length} / 3 models
            </span>
          </div>

          <button
            type="button"
            onClick={selectAllIncinerators}
            className="text-[12.5px] font-bold text-navy hover:underline underline-offset-2"
          >
            Select 3 incinerators (default)
          </button>
        </div>

        {warning && (
          <div className="mx-5 sm:mx-6 mt-2 flex items-center gap-2 rounded-[12px] bg-amber-50 border border-amber-200/80 px-3.5 py-2 text-[12.5px] font-medium text-amber-900">
            <AlertCircle className="size-4 shrink-0 text-amber-600" />
            <span>{warning}</span>
          </div>
        )}

        {/* Products Selection List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {products.map((p) => {
            const isSelected = selected.includes(p.slug);
            const isMaxReached = selected.length >= 3 && !isSelected;

            return (
              <div
                key={p.slug}
                onClick={() => !isMaxReached && toggleProduct(p.slug)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-[16px] sm:rounded-[20px] p-3 sm:p-3.5 border transition-all cursor-pointer select-none",
                  isSelected
                    ? "border-navy bg-[#F0F5FC] shadow-xs"
                    : isMaxReached
                    ? "border-line bg-slate-50/70 opacity-60 cursor-not-allowed"
                    : "border-line bg-white hover:border-slate-300 hover:bg-[#F8FAFD]"
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Thumbnail */}
                  <div className="relative size-14 sm:size-16 shrink-0 rounded-[12px] sm:rounded-[14px] bg-[#EBF1F7] overflow-hidden flex items-center justify-center p-1">
                    <Image
                      src={p.image.src}
                      alt={p.name}
                      width={64}
                      height={64}
                      className="size-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading text-[15px] sm:text-[16px] font-bold text-charcoal truncate">
                        {p.title}
                      </p>
                      {p.badge && (
                        <span className="hidden sm:inline-flex rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-bold text-navy uppercase">
                          {p.badge.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] sm:text-[12.5px] text-muted truncate mt-0.5">
                      {p.specs.dailyCapacity && p.specs.dailyCapacity !== "Not specified"
                        ? `Daily Capacity: ${p.specs.dailyCapacity}`
                        : p.summary || "Sanitary hygiene equipment"}
                    </p>
                    <p className="text-[13px] font-extrabold text-navy mt-1">
                      {formatINR(p.price)}
                    </p>
                  </div>
                </div>

                {/* Checkbox */}
                <div className="shrink-0 pl-2">
                  <div
                    className={cn(
                      "flex size-6 items-center justify-center rounded-[8px] border transition-colors",
                      isSelected
                        ? "bg-navy border-navy text-white shadow-xs"
                        : isMaxReached
                        ? "border-slate-300 bg-slate-200/50 text-transparent"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {isSelected && <Check className="size-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-line bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-[13.5px] font-bold text-charcoal hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={selected.length === 0}
            className={cn(
              "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[14px] font-bold text-white shadow-xs transition-colors",
              selected.length > 0
                ? "bg-navy hover:bg-[#002970]"
                : "bg-slate-400 cursor-not-allowed"
            )}
          >
            Compare {selected.length} {selected.length === 1 ? "Model" : "Models"}
          </button>
        </div>
      </div>
    </div>
  );
}
