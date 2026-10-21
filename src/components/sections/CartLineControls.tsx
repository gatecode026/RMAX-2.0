"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { requestJson } from "@/lib/client-api";

/** "Quantity − 1 + · Remove" */
export function CartLineControls({ slug, quantity }: { slug: string; quantity: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <button type="button" className={stepper} disabled={busy || quantity >= 999} onClick={() => setQty(quantity + 1)} aria-label="Increase quantity">
        <Plus className="size-3.5" aria-hidden />
      </button>
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
    </div>
  );
}
