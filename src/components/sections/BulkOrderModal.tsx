"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Building2, Minus, Plus, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/format";

export type BulkOrderModalDetail = { label: string; value: string };

type Props = {
  open: boolean;
  onClose: () => void;
  /** Display name of the product this quantity applies to. */
  productLabel: string;
  unitPrice: number;
  /** Extra rows shown above the quantity (e.g. colour, operating mode). */
  details?: BulkOrderModalDetail[];
  /** Builds the "Request Bulk Quotation" destination for a given quantity. */
  quoteHref: (quantity: number) => string;
  /** Called when the visitor chooses to stay within the direct-order cap instead — responsible for closing the modal itself (it decides the final quantity, so `onClose`'s own cancel-restore logic must not also run). */
  onKeepMax: () => void;
  maxQty?: number;
  initialQuantity?: number;
};

/**
 * Shared "you've gone over the direct-order cap" popup — used wherever a quantity selector
 * would otherwise exceed the 5-unit direct-order limit (product page, cart line controls).
 * Replaces showing an inline banner "below" the control, per design feedback: the limit should
 * surface as a popup at the moment it's hit, not as a persistent block of page copy.
 */
export function BulkOrderModal({
  open,
  onClose,
  productLabel,
  unitPrice,
  details = [],
  quoteHref,
  onKeepMax,
  maxQty = 5,
  initialQuantity,
}: Props) {
  const router = useRouter();
  const [bulkQuantity, setBulkQuantity] = useState(Math.max(maxQty + 1, initialQuantity ?? maxQty + 1));

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] rounded-[24px] border border-line bg-card p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-order-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 grid size-9 place-items-center rounded-full bg-soft text-charcoal hover:bg-line transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-navy/10 text-navy">
            <Building2 className="size-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wide uppercase text-navy">Institutional & B2B Orders</span>
            <h3 id="bulk-order-modal-title" className="font-heading text-[22px] font-extrabold text-charcoal leading-tight">
              Planning to Buy in Bulk?
            </h3>
          </div>
        </div>

        <p className="mt-3.5 text-body-sm leading-relaxed text-muted">
          You&apos;re ordering more than {maxQty} units. Send us your requirements and our team will provide a
          customised quotation with volume discounts and priority dispatch.
        </p>

        <div className="mt-5 rounded-[18px] border border-line bg-soft/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted">Selected Product:</span>
            <span className="font-bold text-charcoal">{productLabel}</span>
          </div>
          {details.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-body-sm">
              <span className="text-muted">{d.label}:</span>
              <span className="font-bold text-charcoal capitalize">{d.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-body-sm pt-2 border-t border-line/60">
            <span className="text-muted">Requested Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBulkQuantity((b) => Math.max(maxQty + 1, b - 1))}
                className="grid size-7 place-items-center rounded-full bg-card border border-line text-navy hover:bg-soft cursor-pointer"
                aria-label="Decrease requested quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="font-extrabold text-navy px-2 text-[15px]">{bulkQuantity} Units</span>
              <button
                type="button"
                onClick={() => setBulkQuantity((b) => b + 1)}
                className="grid size-7 place-items-center rounded-full bg-card border border-line text-navy hover:bg-soft cursor-pointer"
                aria-label="Increase requested quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-body-sm pt-2 border-t border-line/60">
            <span className="text-muted">Estimated Product Value:</span>
            <div className="text-right">
              <span className="font-extrabold text-charcoal text-[17px]">{formatINR(unitPrice * bulkQuantity)}</span>
              <span className="block text-[11px] text-muted-dark">+ 18% GST (Applicable for ITC)</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push(quoteHref(bulkQuantity));
            }}
            className="w-full sm:flex-1 h-[48px] rounded-[14px] bg-navy font-bold text-white shadow-xs hover:bg-navy/90 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            Request Bulk Quotation
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={onKeepMax}
            className="w-full sm:w-auto h-[48px] px-5 rounded-[14px] border border-line font-bold text-charcoal hover:bg-soft transition cursor-pointer"
          >
            Continue with {maxQty} Units
          </button>
        </div>
      </div>
    </div>
  );
}
