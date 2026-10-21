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

  const stepper = "grid size-7 place-items-center rounded-full bg-soft text-navy transition hover:bg-line disabled:opacity-40";
  const quoteHref = quoteModel ? `/institutional-quote?model=${quoteModel}&qty=${qty}` : "/contact-us";

  return (
    <div className="rounded-[28px] border border-line bg-card p-6 shadow-card">
      {mrp ? (
        <p className="text-body-sm text-muted-dark">
          M.R.P.: <span className="font-bold line-through">{formatINR(mrp)}</span>
        </p>
      ) : (
        <p aria-hidden className="h-5" />
      )}
      <p className="mt-1 font-jakarta text-[40px]/[48px] font-extrabold tracking-[-0.01em] text-charcoal md:text-[44px]/[52px]">{formatINR(price)}</p>
      <p className="mt-1 text-[11px] text-muted-dark">Include of all tax</p>

      {showOptions && (
        <dl className="mt-5 flex flex-col gap-4 text-body-sm text-muted">
          <div className="flex items-center justify-between gap-3">
            <dt>Quantity:</dt>
            <dd className="flex items-center gap-4 text-charcoal">
              <button type="button" className={stepper} onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
                <Minus className="size-3.5" aria-hidden />
              </button>
              <span className="min-w-3 text-center font-bold" aria-live="polite">
                {qty}
              </span>
              <button type="button" className={stepper} onClick={() => setQty((q) => Math.min(999, q + 1))} aria-label="Increase quantity">
                <Plus className="size-3.5" aria-hidden />
              </button>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt>
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
            <div className="flex items-center justify-between gap-3">
              <dt id={`${typeId}-colour`}>Colour:</dt>
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
                      className={cn("flex items-center gap-2 rounded-full pr-1", on ? "font-bold text-charcoal" : "text-muted")}
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

      <div className="mt-6 flex flex-col gap-3">
        <ButtonLink href={quoteHref} className="h-[50px] w-full">
          Request a Quote
        </ButtonLink>
        <ButtonLink href="/compare-models" variant="outline" className="h-[50px] w-full" data-slug={slug}>
          Add to compare
        </ButtonLink>
      </div>
    </div>
  );
}
