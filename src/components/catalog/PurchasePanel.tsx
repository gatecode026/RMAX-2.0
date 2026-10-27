"use client";

import { useId, useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
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
};

/** Price card: M.R.P., price, quantity, type, colour and the two CTAs. */
export function PurchasePanel({ slug, price, mrp, colours, quoteModel, showOptions }: Props) {
  const [qty, setQty] = useState(1);
  const [colour, setColour] = useState(colours[0] ?? "");
  const typeId = useId();

  const totalPrice = price * qty;
  const totalMrp = mrp ? mrp * qty : undefined;
  const stepper = "grid size-7 place-items-center rounded-full bg-soft text-navy transition hover:bg-line disabled:opacity-40";
  const quoteHref = quoteModel ? `/institutional-quote?model=${quoteModel}&qty=${qty}` : "/contact-us";

  return (
    <div className="rounded-[24px] border border-line bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          {totalMrp ? (
            <p className="text-body-sm text-muted-dark">
              M.R.P.: <span className="font-bold line-through">{formatINR(totalMrp)}</span>
              {qty > 1 && mrp ? <span className="ml-1.5 text-xs text-muted font-normal">({formatINR(mrp)} / unit)</span> : null}
            </p>
          ) : null}
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-jakarta text-[36px]/[44px] md:text-[40px]/[48px] font-extrabold tracking-[-0.01em] text-charcoal">
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

      {showOptions && (
        <dl className="mt-5 flex flex-wrap items-center justify-between gap-4 py-4 border-y border-line/70 text-body-sm text-muted">
          <div className="flex items-center gap-3">
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
                  setQty(Math.max(1, Math.min(999, val)));
                }}
                className="w-10 text-center font-bold text-charcoal bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-navy/40 rounded py-0.5"
                aria-label="Quantity"
              />
              <button
                type="button"
                className={stepper}
                onClick={() => setQty((q) => Math.min(999, q + 1))}
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" aria-hidden />
              </button>
            </dd>
          </div>

          <div className="flex items-center gap-3">
            <dt className="font-medium text-charcoal">
              <label htmlFor={typeId}>Type:</label>
            </dt>
            <dd className="relative">
              <select
                id={typeId}
                defaultValue="Automatic"
                className="h-9 w-[135px] appearance-none rounded-[10px] border border-line bg-card pr-8 pl-3 text-body-sm font-semibold text-charcoal focus:border-navy focus:outline-none"
              >
                <option>Automatic</option>
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

      <div className="mt-5 flex flex-col sm:flex-row items-center gap-3.5">
        <ButtonLink href={quoteHref} className="h-[48px] w-full sm:flex-1">
          Request a Quote
        </ButtonLink>
        <ButtonLink href="/compare-models" variant="outline" className="h-[48px] w-full sm:flex-1" data-slug={slug}>
          Add to compare
        </ButtonLink>
      </div>
    </div>
  );
}
