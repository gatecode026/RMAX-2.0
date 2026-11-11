"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { requestJson } from "@/lib/client-api";
import { BulkOrderModal } from "@/components/sections/BulkOrderModal";

const MAX_DIRECT_QTY = 5;

/** "Quantity − 1 + · Remove" */
export function CartLineControls({
  slug,
  quantity,
  title,
  price,
}: {
  slug: string;
  quantity: number;
  /** Product display name and unit price — shown in the bulk-order popup past 5 units. */
  title: string;
  price: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  async function setQty(next: number) {
    setBusy(true);
    setError(null);
    const res = await requestJson("/api/cart", "PATCH", { slug, quantity: next });
    if (!res.ok) setError(res.message);
    router.refresh();
    setBusy(false);
  }

  const stepper = "grid size-7 place-items-center rounded-full border border-line text-navy transition hover:bg-soft disabled:opacity-40";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span id={`qty-${slug}`}>Quantity</span>
      <button type="button" className={stepper} disabled={busy || quantity <= 1} onClick={() => setQty(quantity - 1)} aria-label="Decrease quantity">
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span aria-labelledby={`qty-${slug}`} className="min-w-4 text-center" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className={stepper}
        disabled={busy}
        onClick={() => (quantity >= MAX_DIRECT_QTY ? setBulkModalOpen(true) : setQty(quantity + 1))}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
      {quantity >= MAX_DIRECT_QTY && <span className="text-[11px] font-semibold text-navy">(Max 5 direct)</span>}
      <span aria-hidden className="text-muted">
        ·
      </span>
      <button type="button" className="font-bold underline-offset-4 hover:text-navy hover:underline disabled:opacity-40" disabled={busy} onClick={() => setQty(0)}>
        Remove
      </button>
      {error && (
        <span role="alert" className="w-full text-danger">
          {error}
        </span>
      )}

      <BulkOrderModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        productLabel={title}
        unitPrice={price}
        quoteHref={(qty) => `/request-quotation?model=${encodeURIComponent(slug)}&qty=${qty}`}
        onKeepMax={() => setBulkModalOpen(false)} // already at the 5-unit cap in the cart — just close
      />
    </div>
  );
}
