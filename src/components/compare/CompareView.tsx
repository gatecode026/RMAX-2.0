"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Plus, SlidersHorizontal } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { BuyButton } from "@/components/sections/BuyButton";
import { ButtonLink } from "@/components/ui/Button";
import { CompareModal } from "@/components/compare/CompareModal";
import { formatINR } from "@/lib/format";
import { SPEC_ROWS } from "@/lib/specs";
import type { ProductDTO } from "@/lib/data/content";

interface CompareViewProps {
  allProducts: ProductDTO[];
  initialSelectedSlugs?: string[];
  initialOpenSelector?: boolean;
}

export function CompareView({
  allProducts,
  initialSelectedSlugs = ["basic", "pro", "pro-max"],
  initialOpenSelector = false,
}: CompareViewProps) {
  // Ensure we have at least 1 valid slug
  const validInitial = initialSelectedSlugs.filter((s) => allProducts.some((p) => p.slug === s));
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    validInitial.length > 0 ? validInitial.slice(0, 3) : ["basic", "pro", "pro-max"]
  );
  const [isModalOpen, setIsModalOpen] = useState(initialOpenSelector);

  const selectedProducts = selectedSlugs
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter((p): p is ProductDTO => p !== undefined);

  const removeProduct = (slug: string) => {
    if (selectedSlugs.length > 1) {
      setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    }
  };

  const handleApply = (newSlugs: string[]) => {
    setSelectedSlugs(newSlugs.slice(0, 3));
    // Update browser URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set("models", newSlugs.slice(0, 3).join(","));
    url.searchParams.delete("select");
    window.history.replaceState({}, "", url.toString());
  };

  // Determine dynamic grid columns based on number of active comparison slots (always up to 3)
  // Total slots: 1 info column (244fr) + selected columns + empty slot if < 3
  const activeColCount = selectedProducts.length;
  const showAddSlot = activeColCount < 3;
  const totalModelCols = showAddSlot ? activeColCount + 1 : activeColCount;

  const colClass =
    totalModelCols === 3
      ? "grid grid-cols-[244fr_304fr_304fr_304fr]"
      : totalModelCols === 2
      ? "grid grid-cols-[260fr_340fr_340fr]"
      : "grid grid-cols-[280fr_400fr]";

  return (
    <>
      {/* Top Model Selector Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 rounded-[20px] bg-gradient-to-r from-[#F0F5FC] to-[#F8FAFD] p-3.5 sm:p-4.5 border border-line shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-bold text-charcoal">Comparing models:</span>
          {selectedProducts.map((p) => (
            <span
              key={p.slug}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-line px-3 py-1 text-[12.5px] font-bold text-charcoal shadow-2xs"
            >
              {p.name}
              {selectedProducts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(p.slug)}
                  className="rounded-full p-0.5 text-muted hover:bg-slate-100 hover:text-charcoal transition-colors"
                  aria-label={`Remove ${p.name}`}
                >
                  <X className="size-3" />
                </button>
              )}
            </span>
          ))}
          <span className="text-[12px] font-medium text-muted">
            ({selectedProducts.length} of max 3 selected)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#18427F] hover:bg-[#002970] px-5 py-2.5 text-[13px] font-bold text-white shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <SlidersHorizontal className="size-3.5" />
          Choose models (max 3)
        </button>
      </div>

      {/* Main Comparison Container Card */}
      <div className="overflow-hidden rounded-[28px] sm:rounded-card-lg border border-line bg-card shadow-card">
        <div className="relative overflow-x-auto">
          <div className="min-w-[1156px]">
            {/* Product Header Row */}
            <div className={`${colClass} items-stretch pt-6 pb-6`}>
              {/* Left Column: Offer & Fit description */}
              <div className="flex flex-col justify-end gap-3 pl-6 pr-4">
                <Pill>50% launch offers</Pill>
                <h2 className="text-title">Find your fit.</h2>
                <p className="text-body text-muted">
                  All models share enclosed operation, odor-free burning and low maintenance.
                </p>
              </div>

              {/* Selected Product Columns */}
              {selectedProducts.map((p) => (
                <div key={p.slug} className="relative pl-6 pr-3 flex flex-col justify-between">
                  {/* Top Remove Badge */}
                  {selectedProducts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(p.slug)}
                      className="absolute top-2 right-5 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-xs border border-line px-2.5 py-1 text-[11px] font-bold text-muted hover:text-charcoal hover:border-slate-300 shadow-2xs transition-colors cursor-pointer"
                      title={`Remove ${p.name} from comparison`}
                    >
                      <X className="size-3" />
                      Remove
                    </button>
                  )}

                  <div>
                    <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#EBF1F7] flex items-center justify-center h-[190px]">
                      <Image
                        src={p.image.src}
                        alt={p.image.alt || p.name}
                        width={280}
                        height={190}
                        className="h-[190px] w-full object-contain p-2"
                      />
                    </div>
                    <h3 className="mt-5 text-title">{p.name}</h3>
                    <p className="mt-2 font-heading text-[32px]/10 font-extrabold text-charcoal">
                      {formatINR(p.price)}
                    </p>
                    {p.originalPrice > p.price && (
                      <p className="mt-1 text-body-sm text-muted line-through">
                        <span className="sr-only">Original price </span>
                        {formatINR(p.originalPrice)}
                      </p>
                    )}
                  </div>

                  <div className="mt-5">
                    <BuyButton slug={p.slug} />
                    <ButtonLink
                      href={`/institutional-quote?model=${p.slug}`}
                      variant="secondary"
                      className="mt-3 w-full"
                    >
                      Request quote
                    </ButtonLink>
                  </div>
                </div>
              ))}

              {/* Empty slot column to prompt adding a model if fewer than 3 */}
              {showAddSlot && (
                <div className="pl-6 pr-4 flex flex-col items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex flex-col items-center justify-center size-full min-h-[340px] rounded-[24px] border-2 border-dashed border-slate-300 hover:border-navy bg-soft/40 hover:bg-soft transition-all p-6 text-center group cursor-pointer"
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-white shadow-xs border border-line text-navy group-hover:scale-110 transition-transform">
                      <Plus className="size-6" />
                    </span>
                    <p className="mt-3 font-heading text-[16px] font-bold text-charcoal">
                      Add another model
                    </p>
                    <p className="mt-1 text-[12px] text-muted max-w-[180px]">
                      Select from the catalog to compare up to 3 models side-by-side
                    </p>
                  </button>
                </div>
              )}
            </div>

            {/* Specification Comparison Table */}
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">Specification comparison of selected models</caption>
              <colgroup>
                <col style={{ width: totalModelCols === 3 ? "21.1%" : totalModelCols === 2 ? "28%" : "35%" }} />
                {selectedProducts.map((p) => (
                  <col
                    key={p.slug}
                    style={{
                      width:
                        totalModelCols === 3
                          ? "26.3%"
                          : totalModelCols === 2
                          ? "36%"
                          : "65%",
                    }}
                  />
                ))}
                {showAddSlot && (
                  <col
                    style={{
                      width: totalModelCols === 3 ? "26.3%" : "36%",
                    }}
                  />
                )}
              </colgroup>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Specification</th>
                  {selectedProducts.map((p) => (
                    <th key={p.slug} scope="col">
                      {p.name}
                    </th>
                  ))}
                  {showAddSlot && <th scope="col">Add Model</th>}
                </tr>
              </thead>
              <tbody>
                {SPEC_ROWS.map((row) => (
                  <tr key={row.key} className="h-[57px] odd:bg-soft/60">
                    <th scope="row" className="pl-6 text-body font-bold text-charcoal">
                      {row.label}
                    </th>
                    {selectedProducts.map((p) => (
                      <td key={p.slug} className="pl-6 text-body text-muted font-medium">
                        {p.specs[row.key] || "—"}
                      </td>
                    ))}
                    {showAddSlot && <td className="pl-6 text-body text-muted/50">—</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Model Selection Modal */}
      <CompareModal
        products={allProducts}
        selectedSlugs={selectedSlugs}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApply}
      />
    </>
  );
}
