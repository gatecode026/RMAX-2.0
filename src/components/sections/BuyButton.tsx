"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";

/** Adds one unit of a model to the cart, then goes to the cart page. */
export function BuyButton({
  slug,
  className,
  buttonClassName,
}: {
  slug: string;
  className?: string;
  buttonClassName?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.status === 401 || res.status === 403) {
        // Direct purchase requires a Customer account — preserve the selection and send the
        // visitor to sign in, returning straight back to add it once authenticated.
        const next = `/cart?addSlug=${encodeURIComponent(slug)}&addQty=1`;
        router.push(`/?auth=login&next=${encodeURIComponent(next)}`);
        return;
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Could not add to cart.");
      router.push("/cart");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add to cart.");
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={add}
        disabled={busy}
        className={cn(
          "inline-flex items-center justify-center font-bold transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          buttonClassName ?? "w-full h-11 px-6 rounded-action bg-navy text-white hover:brightness-110",
        )}
      >
        {busy ? "Adding…" : "Buy this model"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-body-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
