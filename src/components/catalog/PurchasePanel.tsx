"use client";

import { useId, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Minus, Plus, Check } from "lucide-react";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { BulkOrderModal } from "@/components/sections/BulkOrderModal";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";
import type { PickerGroup } from "@/lib/catalog";
import { TypeDropdown, VariantPicker } from "@/components/catalog/VariantPicker";

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
  stockStatus?: string;
  /** Option dropdowns of the product's family (empty for standalone products). */
  groups?: PickerGroup[];
  /** Exact option text, e.g. "Vending Machine · Manual · 50 Pads" (empty for standalone products). */
  optionLabel?: string;
};

/** Bank variants printed on the GEOSAT GPS device label (the GPS tracker is customised per bank). */
const GPS_BANKS = ["SBI", "BOB", "BOI", "BOM", "CBI", "PNB", "Others"].map((b) => ({ value: b, label: b }));

/** Price card: M.R.P., price, model switcher, quantity, type, colour, CTAs, and bulk policy. */
export function PurchasePanel({ slug, price, mrp, colours, quoteModel, showOptions, stockStatus, groups = [], optionLabel }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [colour, setColour] = useState(colours[0] ?? "");
  const isGps = slug === "gps-trackers";
  const [selectedTypeRaw, setSelectedType] = useState(isGps ? GPS_BANKS[0].value : "");
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTypeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState(6);
  // Quantity to restore if the bulk popup is dismissed without the visitor choosing to proceed —
  // opening the popup provisionally shows 5 on the page, but closing it (X / backdrop) should
  // put the selector back where it was, not leave it stuck at 5.
  const [preModalQty, setPreModalQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const typeId = useId();

  // Only the GPS tracker has a free-standing type (bank); every other option comes from the product family.
  const typeOptions = isGps ? GPS_BANKS : [];
  const selectedType = typeOptions.some((o) => o.value === selectedTypeRaw) ? selectedTypeRaw : typeOptions[0]?.value ?? "";
  const currentModelName = optionLabel || slug;
  const onRequest = price <= 0 || stockStatus === "enquiry-only"; // quotation-only product: no published price
  const displayPrice = price * qty;
  const displayMrp = mrp && mrp > price ? mrp * qty : undefined;
  const stepper = "grid size-7 place-items-center rounded-full bg-soft text-navy transition hover:bg-line disabled:opacity-40 cursor-pointer";
  const family = groups.length > 0;
  const typeParam = selectedType ? `&type=${encodeURIComponent(selectedType)}` : "";
  const quoteHref = showOptions
    ? `/request-quotation?model=${encodeURIComponent(slug)}&qty=${qty}&colour=${encodeURIComponent(colour)}${typeParam}`
    : `/request-quotation?model=${encodeURIComponent(slug)}${typeParam}`;

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
        // quantity in the return URL so it's added automatically once signed in. Reset the
        // button here too — if the visitor lands back on this page (e.g. via browser back
        // after closing the login modal), it must not still read "Adding…".
        setIsAdding(false);
        const next = `/cart?addSlug=${encodeURIComponent(slug)}&addQty=${qty}`;
        router.push(`/?auth=login&next=${encodeURIComponent(next)}`);
        return;
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Could not add to cart.");
      setIsAdding(false);
      router.push("/cart");
      router.refresh();
    } catch (e) {
      setBuyError(e instanceof Error ? e.message : "Could not add to cart.");
      setIsAdding(false);
    }
  }

  function handleOpenBulkModal(targetQty: number = 6) {
    setPreModalQty(qty); // remember so cancelling the popup restores this instead of staying at 5
    setBulkQuantity(Math.max(6, targetQty));
    setQty(5);
    setBulkModalOpen(true);
  }

  /** X button / backdrop click — popup dismissed without choosing to proceed. */
  function handleCancelBulkModal() {
    setBulkModalOpen(false);
    setQty(preModalQty);
  }

  /** "Continue with 5 Units" — the visitor deliberately keeps the 5-unit selection. */
  function handleKeepFive() {
    setQty(5);
    setBulkModalOpen(false);
  }

  return (
    <div className="rounded-[24px] border border-line bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        {displayMrp ? (
          <p className="text-body-sm text-muted-dark">
            M.R.P.: <span className="font-bold line-through text-[#94A3B8]">{formatINR(displayMrp)}</span>
          </p>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-heading text-section md:text-[38px]/[44px] font-extrabold tracking-[-1px] text-charcoal">
            {onRequest ? "Price on request" : formatINR(displayPrice)}
          </span>
          {qty > 1 && !onRequest && (
            <span className="text-body-sm font-semibold text-muted">
              ({formatINR(price)} / piece)
            </span>
          )}
        </div>
        {!onRequest && <span className="text-[12px] text-muted-dark font-medium">Inclusive of all taxes</span>}
      </div>

      {family && (
        <VariantPicker
          className="mt-4 border-t border-line/70 pt-3.5"
          groups={groups}
          onModel={(target) => router.push(`/products/${target}`, { scroll: false })}
        />
      )}

      {showOptions && (
        <dl className="mt-5 flex flex-col gap-3 py-4 border-y border-line/70 text-body-sm text-muted">
          <div className="flex items-center justify-between gap-3">
            <dt className="font-medium text-charcoal">Quantity:</dt>
            <dd className="flex items-center gap-2 text-charcoal">
              <button
                type="button"
                className={stepper}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
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
                    handleOpenBulkModal(val);
                  } else {
                    setQty(Math.max(1, val));
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

          {isGps && (
          <div className="flex items-center justify-between gap-3">
            <dt className="font-medium text-charcoal">
              <label id={typeId}>Bank Type:</label>
            </dt>
            <dd className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setTypeDropdownOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={typeDropdownOpen}
                aria-labelledby={typeId}
                className="flex h-9 min-w-[140px] items-center justify-between rounded-[10px] border border-line bg-card px-3 text-body-sm font-semibold text-charcoal shadow-xs hover:border-navy focus:border-navy focus:outline-none transition-colors cursor-pointer"
              >
                <span>{typeOptions.find((o) => o.value === selectedType)?.label || selectedType}</span>
                <ChevronDown
                  className={cn("size-4 text-charcoal transition-transform duration-200 ml-2", typeDropdownOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </button>

              {typeDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 top-full mt-1.5 z-40 min-w-[180px] overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {typeOptions.map((opt) => {
                    const isSelected = opt.value === selectedType;
                    return (
                      <div
                        key={opt.value}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setSelectedType(opt.value);
                          setTypeDropdownOpen(false);
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-colors cursor-pointer",
                          isSelected
                            ? "bg-[#EFF6FF] text-navy font-bold"
                            : "text-[#0F172A] hover:bg-[#F8FAFC] hover:text-navy"
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="size-4 text-navy ml-2 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </dd>
          </div>

          )}

          {colours.length > 0 && (
            <div className="flex items-center justify-between gap-3">
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

      <div className="mt-5 flex flex-col gap-2.5 w-full">
        <ButtonLink href={quoteHref} className="h-[48px] w-full justify-center">
          Request a Quote
        </ButtonLink>
        {!onRequest && (
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isAdding}
            className={cn(
              buttonClasses({ variant: "outline", size: "md" }),
              "h-[48px] w-full justify-center font-bold text-navy border-line hover:border-navy hover:bg-navy/5 cursor-pointer"
            )}
          >
            {isAdding ? "Adding…" : "Buy Now"}
          </button>
        )}
      </div>

      {buyError && (
        <p role="alert" className="mt-2 text-body-sm font-semibold text-danger">
          {buyError}
        </p>
      )}

      <BulkOrderModal
        open={bulkModalOpen}
        onClose={handleCancelBulkModal}
        productLabel={currentModelName}
        unitPrice={price}
        initialQuantity={bulkQuantity}
        details={[
          ...(colour ? [{ label: "Selected Colour", value: colour }] : []),
          ...(isGps ? [{ label: "Bank Type", value: selectedType }] : optionLabel ? [{ label: "Option", value: optionLabel }] : []),
        ]}
        quoteHref={(qty) =>
          `/request-quotation?model=${encodeURIComponent(slug)}&qty=${qty}&colour=${encodeURIComponent(colour)}${typeParam}`
        }
        onKeepMax={handleKeepFive}
      />
    </div>
  );
}
