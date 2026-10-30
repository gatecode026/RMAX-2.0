"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Minus, Plus, X, Building2, Package, ArrowRight, ShieldCheck } from "lucide-react";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";

const COLOUR_DOTS: Record<string, { label: string; dot: string }> = {
  blue: { label: "Blue", dot: "#2F5596" },
  pink: { label: "Pink", dot: "#F6B8C6" },
  "off-white": { label: "Off-White", dot: "#FBE18B" },
  red: { label: "Red", dot: "#F25A5E" },
};

type Props = {
  slug: string;
  price: number;
  mrp?: number;
  colours: string[];
  /** Models the quote form knows about; other products are enquired about via Contact Us. */
  quoteModel: string | null;
  showOptions: boolean;
  models?: {
    slug: string;
    name: string;
    price: number;
    dailyCapacity?: string;
    category?: string;
  }[];
};

/** Price card: M.R.P., price, model switcher, quantity, type, colour, CTAs, and bulk policy. */
export function PurchasePanel({ slug, price, mrp, colours, quoteModel, showOptions, models }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [colour, setColour] = useState(colours[0] ?? "");
  const [selectedType, setSelectedType] = useState("Automatic");
  const [showBulkNotice, setShowBulkNotice] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState(6);
  const [isAdding, setIsAdding] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const typeId = useId();

  const isVending = slug.includes("vending");
  const typeOptions = isVending
    ? [
        { value: "Automatic", label: "Automatic" },
        { value: "Manual", label: "Manual" },
        { value: "Push Button", label: "Push Button (No Money / Free)" },
      ]
    : [
        { value: "Automatic", label: "Automatic" },
        { value: "Manual", label: "Manual" },
      ];

  const currentModelName = models?.find((m) => m.slug === slug)?.name ?? slug;
  const totalPrice = price * qty;
  const totalMrp = mrp ? mrp * qty : undefined;
  const stepper = "grid size-7 place-items-center rounded-full bg-soft text-navy transition hover:bg-line disabled:opacity-40 cursor-pointer";
  const quoteHref = `/request-quotation?model=${encodeURIComponent(slug)}&qty=${qty}&colour=${encodeURIComponent(colour)}&type=${encodeURIComponent(selectedType)}`;

  async function handleBuyNow() {
    setIsAdding(true);
    setBuyError(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, quantity: qty }),
      });
      if (res.status === 401 || res.status === 403) {
        // Direct purchase requires a Customer account. Preserve the selected model and
        // quantity in the return URL so it's added automatically once signed in.
        const next = `/cart?addSlug=${encodeURIComponent(slug)}&addQty=${qty}`;
        router.push(`/?auth=login&next=${encodeURIComponent(next)}`);
        return;
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Could not add to cart.");
      router.push("/cart");
      router.refresh();
    } catch (e) {
      setBuyError(e instanceof Error ? e.message : "Could not add to cart.");
      setIsAdding(false);
    }
  }

  function handleOpenBulkModal(targetQty: number = 6) {
    setBulkQuantity(Math.max(6, targetQty));
    setBulkModalOpen(true);
  }

  return (
    <div className="rounded-[24px] border border-line bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          {totalMrp ? (
            <p className="text-body-sm text-muted-dark">
              M.R.P.: <span className="font-bold diagonal-strike">{formatINR(totalMrp)}</span>
              {qty > 1 && mrp ? <span className="ml-1.5 text-xs text-muted font-normal">({formatINR(mrp)} / unit)</span> : null}
            </p>
          ) : null}
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-heading text-section md:text-[40px]/[48px] font-extrabold tracking-[-1px] text-charcoal">
              {formatINR(totalPrice)}
            </span>
            {qty > 1 && (
              <span className="text-body-sm font-semibold text-muted">
                ({formatINR(price)} / unit)
              </span>
            )}
            <span className="text-[12px] text-muted-dark font-medium">Include of all tax</span>
          </div>
        </div>
      </div>

      {models && models.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-line/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-charcoal">Select Model:</span>
            <span className="text-[11px] font-bold text-navy bg-[#EFF6FF] px-2.5 py-0.5 rounded-full">
              {models.find((m) => m.slug === slug)?.name ?? "Selected"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {models.map((m) => {
              const active = m.slug === slug;
              return (
                <button
                  key={m.slug}
                  type="button"
                  onClick={() => {
                    if (m.slug !== slug) {
                      router.push(`/products/${m.slug}`);
                    }
                  }}
                  className={cn(
                    "flex flex-col items-start p-2.5 rounded-[12px] border text-left transition-all cursor-pointer",
                    active
                      ? "border-navy bg-[#EFF6FF] ring-2 ring-navy text-navy font-bold shadow-xs"
                      : "border-line bg-card hover:border-navy/40 hover:bg-soft text-charcoal"
                  )}
                >
                  <span className="text-[12.5px] font-bold leading-tight line-clamp-1">{m.name}</span>
                  <span className="mt-1 text-[12.5px] font-extrabold text-charcoal">{formatINR(m.price)}</span>
                  <span className="mt-0.5 text-[9.5px] text-muted truncate w-full">
                    {m.category === "incinerator"
                      ? (m.dailyCapacity ? m.dailyCapacity.replace("/day", " pads/d") : "Incinerator")
                      : "3 Types (Push/Auto)"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showOptions && (
        <dl className="mt-5 flex flex-wrap items-center justify-between gap-4 py-4 border-y border-line/70 text-body-sm text-muted">
          <div className="flex items-center gap-3">
            <dt className="font-medium text-charcoal">Quantity:</dt>
            <dd className="flex items-center gap-2 text-charcoal">
              <button
                type="button"
                className={stepper}
                onClick={() => {
                  setQty((q) => Math.max(1, q - 1));
                  setShowBulkNotice(false);
                }}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" aria-hidden />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={qty}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  if (!raw) {
                    setQty(1);
                    return;
                  }
                  const val = parseInt(raw, 10);
                  if (val > 5) {
                    setQty(5);
                    handleOpenBulkModal(val);
                  } else {
                    setQty(Math.max(1, val));
                    setShowBulkNotice(false);
                  }
                }}
                className="w-10 text-center font-bold text-charcoal bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-navy/40 rounded py-0.5"
                aria-label="Quantity"
              />
              <button
                type="button"
                className={stepper}
                onClick={() => {
                  if (qty >= 5) {
                    handleOpenBulkModal(6);
                  } else {
                    setQty((q) => Math.min(5, q + 1));
                  }
                }}
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" aria-hidden />
              </button>
              <span className="text-[11px] text-muted">(Max 5 direct)</span>
            </dd>
          </div>

          <div className="flex items-center gap-3">
            <dt className="font-medium text-charcoal">
              <label htmlFor={typeId}>Type:</label>
            </dt>
            <dd className="relative">
              <select
                id={typeId}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 min-w-[140px] appearance-none rounded-[10px] border border-line bg-card pr-8 pl-3 text-body-sm font-semibold text-charcoal focus:border-navy focus:outline-none"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-charcoal" />
            </dd>
          </div>

          {colours.length > 0 && (
            <div className="flex items-center gap-3">
              <dt id={`${typeId}-colour`} className="font-medium text-charcoal">Colour:</dt>
              <dd className="flex items-center gap-3" role="radiogroup" aria-labelledby={`${typeId}-colour`}>
                {colours.map((c) => {
                  const meta = COLOUR_DOTS[c] ?? { label: c, dot: "#ccc" };
                  const on = colour === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setColour(c)}
                      className={cn("flex items-center gap-2 rounded-full pr-1 transition-all", on ? "font-bold text-charcoal" : "text-muted hover:text-charcoal")}
                    >
                      <span
                        aria-hidden
                        className={cn("size-[22px] rounded-full border-2 border-white", on ? "ring-2 ring-navy" : "ring-1 ring-line")}
                        style={{ background: meta.dot }}
                      />
                      {meta.label}
                    </button>
                  );
                })}
              </dd>
            </div>
          )}
        </dl>
      )}

      {/* Description caption for selected type */}
      {isVending && selectedType === "Push Button" && (
        <p className="mt-2.5 text-[12px] text-[#0B62FF] bg-[#EFF6FF] px-3 py-1.5 rounded-lg font-medium">
          Push Button type: Dispenses automatically with a single push — no coins or money required.
        </p>
      )}

      {/* Bulk Order Inquiry Notice when qty >= 5 */}
      {(qty >= 5 || showBulkNotice) && (
        <div className="mt-3.5 rounded-[14px] bg-[#EFF6FF] border border-[#BFDBFE] p-3 text-[12.5px] text-[#1E40AF]">
          <p className="font-bold">Direct orders are limited to 5 units maximum.</p>
          <p className="mt-1 text-[#3B82F6]">
            For bulk institutional orders (6+ units), discounted pricing, or customized setup, please{" "}
            <a
              href={`/institutional-quote?model=${quoteModel || slug}&qty=${Math.max(qty, 6)}`}
              className="font-bold underline hover:text-[#1D4ED8]"
            >
              submit an inquiry
            </a>{" "}
            or email us at{" "}
            <a href="mailto:mukesh@rmaxelectro.com" className="font-bold underline hover:text-[#1D4ED8]">
              mukesh@rmaxelectro.com
            </a>.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col sm:flex-row items-center gap-3.5">
        <ButtonLink href={quoteHref} className="h-[48px] w-full sm:flex-1">
          Request a Quote
        </ButtonLink>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isAdding}
          className={cn(
            buttonClasses({ variant: "outline", size: "sm" }),
            "h-[48px] w-full sm:flex-1 cursor-pointer"
          )}
        >
          {isAdding ? "Adding…" : "Buy Now"}
        </button>
      </div>

      {buyError && (
        <p role="alert" className="mt-2 text-body-sm font-semibold text-danger">
          {buyError}
        </p>
      )}

      {/* Trust & Warranty Policy Badges */}
      <div className="mt-5 pt-3.5 border-t border-line/60 flex flex-col gap-1.5 text-[12px]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-charcoal font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            1 Year Warranty
          </span>
          <span className="text-muted">·</span>
          <span>Piece-to-piece return for defects</span>
          <span className="text-muted">·</span>
          <span>100% Made in India</span>
        </div>
        <p className="text-[11.5px] text-muted leading-relaxed">
          Physical damage is non-returnable. Repairing parts and service support available even after warranty ends.
        </p>
      </div>

      {/* Bulk Order Inquiry Modal */}
      {bulkModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setBulkModalOpen(false)}
        >
          <div
            className="relative w-full max-w-[520px] rounded-[24px] border border-line bg-card p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setBulkModalOpen(false)}
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
                <h3 className="font-heading text-[22px] font-extrabold text-charcoal leading-tight">
                  Planning to Buy in Bulk?
                </h3>
              </div>
            </div>

            <p className="mt-3.5 text-body-sm leading-relaxed text-muted">
              You&apos;re ordering more than 5 units. Send us your requirements and our team will provide a customised quotation with volume discounts and priority dispatch.
            </p>

            <div className="mt-5 rounded-[18px] border border-line bg-soft/60 p-4 space-y-3">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-muted">Selected Product:</span>
                <span className="font-bold text-charcoal">{currentModelName}</span>
              </div>
              {colour && (
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-muted">Selected Colour:</span>
                  <span className="font-bold text-charcoal capitalize">{colour}</span>
                </div>
              )}
              {isVending && (
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-muted">Operating Mode:</span>
                  <span className="font-bold text-charcoal">{selectedType}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-body-sm pt-2 border-t border-line/60">
                <span className="text-muted">Requested Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkQuantity((b) => Math.max(6, b - 1))}
                    className="grid size-7 place-items-center rounded-full bg-card border border-line text-navy hover:bg-soft cursor-pointer"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="font-extrabold text-navy px-2 text-[15px]">{bulkQuantity} Units</span>
                  <button
                    type="button"
                    onClick={() => setBulkQuantity((b) => b + 1)}
                    className="grid size-7 place-items-center rounded-full bg-card border border-line text-navy hover:bg-soft cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-body-sm pt-2 border-t border-line/60">
                <span className="text-muted">Estimated Product Value:</span>
                <div className="text-right">
                  <span className="font-extrabold text-charcoal text-[17px]">
                    {formatINR(price * bulkQuantity)}
                  </span>
                  <span className="block text-[11px] text-muted-dark">+ 18% GST (Applicable for ITC)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setBulkModalOpen(false);
                  router.push(
                    `/request-quotation?model=${encodeURIComponent(slug)}&qty=${bulkQuantity}&colour=${encodeURIComponent(colour)}&type=${encodeURIComponent(selectedType)}`
                  );
                }}
                className="w-full sm:flex-1 h-[48px] rounded-[14px] bg-navy font-bold text-white shadow-xs hover:bg-navy/90 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Request Bulk Quotation
                <ArrowRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setQty(5);
                  setBulkModalOpen(false);
                }}
                className="w-full sm:w-auto h-[48px] px-5 rounded-[14px] border border-line font-bold text-charcoal hover:bg-soft transition cursor-pointer"
              >
                Continue with 5 Units
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
