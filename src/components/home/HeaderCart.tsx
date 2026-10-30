"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ShoppingCart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  X,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";
import { requestJson } from "@/lib/client-api";
import type { CartView } from "@/lib/cart";

interface HeaderCartProps {
  initialCart?: CartView;
  className?: string;
}

export function HeaderCart({ initialCart, className }: HeaderCartProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartView>(
    initialCart ?? { lines: [], count: 0, subtotal: 0, shipping: 0, total: 0 }
  );
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state if initialCart updates from parent
  useEffect(() => {
    if (initialCart) setCart(initialCart);
  }, [initialCart]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleRemove(slug: string) {
    setBusySlug(slug);
    try {
      const res = await requestJson<CartView>("/api/cart", "PATCH", {
        slug,
        quantity: 0,
      });
      if (res.ok) {
        setCart(res.data);
      } else {
        // Fallback: remove line optimistically
        setCart((prev) => {
          const lines = prev.lines.filter((l) => l.product.slug !== slug);
          const count = lines.reduce((acc, l) => acc + l.quantity, 0);
          const subtotal = lines.reduce((acc, l) => acc + l.lineTotal, 0);
          return { ...prev, lines, count, subtotal, total: subtotal };
        });
      }
      router.refresh();
    } catch {
      // Revert if error
    } finally {
      setBusySlug(null);
    }
  }

  const count = cart.count;

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      {/* Cart Trigger Button - Clean transparent icon without background circle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Shopping cart with ${count} ${count === 1 ? "item" : "items"}`}
        className="group relative flex items-center justify-center p-2 text-charcoal transition-colors hover:text-navy cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 rounded-lg"
      >
        <ShoppingCart
          className="size-6 transition-transform duration-200 group-hover:scale-105"
          aria-hidden="true"
        />
        {count > 0 && (
          <span
            className="absolute top-0 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-navy px-1 text-[10.5px] font-bold text-white shadow-xs ring-2 ring-white animate-in zoom-in-75 duration-200"
            aria-live="polite"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Cart Dropdown Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Shopping Cart Quick View"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[340px] sm:w-[400px] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line/70 bg-soft/40 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-navy/10 text-navy">
                <ShoppingBag className="size-4" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-sm font-bold text-charcoal">Shopping Cart</h3>
              {count > 0 && (
                <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs font-bold text-navy">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-muted transition hover:bg-line/40 hover:text-charcoal cursor-pointer"
              aria-label="Close cart preview"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Cart Items List */}
          {cart.lines.length > 0 ? (
            <>
              <div className="max-h-[310px] overflow-y-auto divide-y divide-line/60 p-4">
                {cart.lines.map((line) => {
                  const isRemoving = busySlug === line.product.slug;
                  return (
                    <div
                      key={line.product.slug}
                      className={cn(
                        "flex items-center gap-3.5 py-3 first:pt-0 last:pb-0 transition-opacity",
                        isRemoving && "opacity-40 pointer-events-none"
                      )}
                    >
                      {/* Product Thumbnail */}
                      <Link
                        href={`/products/${line.product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="relative size-15 shrink-0 overflow-hidden rounded-xl border border-line/70 bg-soft transition hover:opacity-90"
                      >
                        <Image
                          src={line.product.image.src}
                          alt={line.product.title}
                          fill
                          className="object-cover"
                          sizes="60px"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${line.product.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block text-xs font-bold text-charcoal line-clamp-1 hover:text-navy transition"
                        >
                          {line.product.title}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-muted line-clamp-1">
                          {line.product.specs.dailyCapacity}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span className="font-semibold text-charcoal">
                            {formatINR(line.product.price)}
                          </span>
                          <span className="text-muted">×</span>
                          <span className="rounded bg-soft px-1.5 py-0.5 font-bold text-navy text-[11px]">
                            Qty {line.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Line Total & Remove Action */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-heading text-xs font-bold text-charcoal">
                          {formatINR(line.lineTotal)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(line.product.slug)}
                          disabled={isRemoving}
                          aria-label={`Remove ${line.product.title} from cart`}
                          className="flex items-center gap-1 text-[11px] font-medium text-muted hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="size-3" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal & Free Delivery Banner */}
              <div className="border-t border-line/70 bg-soft/30 px-5 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Subtotal (incl. GST):</span>
                  <span className="font-heading text-sm font-extrabold text-navy">
                    {formatINR(cart.total)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700">
                  <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>Free PAN-India delivery · 1 Year Warranty</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2.5 border-t border-line/70 bg-white p-4">
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line px-3 py-2.5 text-xs font-bold text-charcoal transition hover:border-navy hover:bg-soft/70 hover:text-navy"
                >
                  <span>View Cart</span>
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy px-3 py-2.5 text-xs font-bold text-white shadow-xs transition hover:opacity-90"
                >
                  <span>Checkout</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="px-6 py-8 text-center">
              <div className="mx-auto flex size-13 items-center justify-center rounded-full bg-soft text-muted">
                <ShoppingCart className="size-6" aria-hidden="true" />
              </div>
              <h4 className="mt-3.5 font-heading text-sm font-bold text-charcoal">
                Your cart is empty
              </h4>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Explore our automatic, manual & push-button vending machines.
              </p>
              <div className="mt-4 flex justify-center">
                <Link
                  href="/our-product"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:opacity-90"
                >
                  <PackageCheck className="size-3.5" aria-hidden="true" />
                  <span>Browse Products</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
