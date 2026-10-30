"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Consumes `?addSlug=&addQty=` left on the /cart URL by Buy Now / Add to Cart when the visitor
 * had to sign in first (see BuyButton.tsx, PurchasePanel.tsx). Runs once on arrival: adds the
 * preserved selection to the now-authenticated customer's cart, then strips the params and
 * refreshes so the server-rendered cart reflects it.
 */
export function CartIntentHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ranRef = useRef(false);

  useEffect(() => {
    const slug = searchParams.get("addSlug");
    const qtyRaw = searchParams.get("addQty");
    if (!slug || ranRef.current) return;
    ranRef.current = true;

    const quantity = Math.min(Math.max(parseInt(qtyRaw || "1", 10) || 1, 1), 5);

    (async () => {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, quantity }),
        });
      } finally {
        router.replace("/cart");
        router.refresh();
      }
    })();
  }, [searchParams, router]);

  return null;
}
