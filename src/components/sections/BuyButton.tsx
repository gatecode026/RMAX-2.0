"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** Adds one unit of a model to the cart, then goes to the cart page. */
export function BuyButton({ slug, className }: { slug: string; className?: string }) {
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
      <Button className="w-full" onClick={add} disabled={busy}>
        {busy ? "Adding…" : "Buy this model"}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-body-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
