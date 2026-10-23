"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { DetailCard, ShowcaseCard } from "@/components/catalog/cards";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";
import type { ProductDTO } from "@/lib/data/content";

type CategoryKey = "all" | "disposable" | "vending" | "gps";
type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "All solutions" },
  { key: "disposable", label: "Pad disposable machines" },
  { key: "vending", label: "Pad vending machines" },
  { key: "gps", label: "GPS trackers (KIOSK banking)" },
];

const TIERS = [
  { slug: "basic", label: "Basic" },
  { slug: "pro", label: "Pro" },
  { slug: "pro-max", label: "Pro Max" },
];

const COLOURS = [
  { key: "blue", label: "Blue", dot: "#2F5596" },
  { key: "pink", label: "Pink", dot: "#F6B8C6" },
  { key: "off-white", label: "Off-White", dot: "#FBE18B" },
  { key: "red", label: "Red", dot: "#F25A5E" },
];

const PRICE_MAX = 15000;
const PRICE_DEFAULT = 8550; // the design's slider rests at ~57 %

/** Accordion section — the design shows ˅ when open and ˄ when closed. */
function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children?: React.ReactNode }) {
  const id = useId();
  return (
    <div className="border-t border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex w-full items-center justify-between px-5 py-[18px] text-left text-body-sm font-bold text-charcoal"
        >
          {title}
          {open ? <ChevronDown aria-hidden className="size-4" /> : <ChevronUp aria-hidden className="size-4" />}
        </button>
      </h3>
      {open && (
        <div id={id} className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductListing({ products }: { products: ProductDTO[] }) {
  const [category, setCategory] = useState<CategoryKey>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [tiers, setTiers] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(PRICE_DEFAULT);
  const [colours, setColours] = useState<string[]>([]);
  const [open, setOpen] = useState({ type: false, tier: true, price: true, colour: true });
  const [mobileFilters, setMobileFilters] = useState(false);
  const filtersId = useId();

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const clear = () => {
    setCategory("all");
    setTiers([]);
    setColours([]);
    setMaxPrice(PRICE_DEFAULT);
    setSort("featured");
  };

  const visible = useMemo(() => {
    let list = products.filter((p) => {
      if (category === "gps") return false;
      if (category === "vending") return p.category === "pad-vending";
      if (p.category === "pad-vending") return false; // "All solutions" shows the incinerator range, as drawn
      return true;
    });
    if (tiers.length) list = list.filter((p) => tiers.includes(p.slug));
    list = list.filter((p) => p.price <= maxPrice);
    if (colours.length) list = list.filter((p) => p.colours.some((c) => colours.includes(c)));
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [products, category, tiers, maxPrice, colours, sort]);

  const showcase = visible;
  const detail = visible.filter((p) => p.category === "incinerator");
  const filtersActive = tiers.length > 0 || colours.length > 0 || maxPrice !== PRICE_DEFAULT || category !== "all";
  const pct = (maxPrice / PRICE_MAX) * 100;

  return (
    <div className="mx-auto w-full max-w-(--container-page) px-5 sm:px-8 xl:px-0">
      {/* Category pills + sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Product category" className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={category === c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "h-10 rounded-full border px-5 text-body-sm font-semibold transition",
                category === c.key ? "border-navy bg-navy text-white" : "border-line bg-card text-charcoal hover:border-navy",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="relative">
          <span className="sr-only">Sort products</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 w-[204px] appearance-none rounded-[12px] border border-line bg-card pr-10 pl-4 text-body-sm text-charcoal focus:border-navy focus:outline-none"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price-asc">Sort by: Price, low to high</option>
            <option value="price-desc">Sort by: Price, high to low</option>
            <option value="name">Sort by: Name</option>
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
        </label>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[302px_1fr]">
        {/* Filters */}
        <aside aria-label="Filters">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-between rounded-input border border-line bg-card px-5 font-bold text-charcoal lg:hidden"
            aria-expanded={mobileFilters}
            aria-controls={filtersId}
            onClick={() => setMobileFilters((v) => !v)}
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal aria-hidden className="size-4" /> Filters
            </span>
            {mobileFilters ? <ChevronUp aria-hidden className="size-4" /> : <ChevronDown aria-hidden className="size-4" />}
          </button>

          <div id={filtersId} className={cn("mt-3 lg:mt-0 lg:block", mobileFilters ? "block" : "hidden")}>
            <div className="overflow-hidden rounded-[24px] border border-line bg-card">
              <div className="flex items-center justify-between px-5 py-5">
                <h2 className="font-jakarta text-[20px]/7 font-bold text-charcoal">Filters</h2>
                <button
                  type="button"
                  onClick={clear}
                  disabled={!filtersActive}
                  className="text-[11px] font-bold text-navy underline-offset-4 hover:underline disabled:opacity-50"
                >
                  clear all
                </button>
              </div>

              <Section title="Product Type" open={open.type} onToggle={() => setOpen((o) => ({ ...o, type: !o.type }))}>
                <ul className="flex flex-col gap-2">
                  {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                    <li key={c.key}>
                      <label className="flex cursor-pointer items-center gap-3 text-body-sm text-muted">
                        <input
                          type="radio"
                          name="product-type"
                          checked={category === c.key}
                          onChange={() => setCategory(c.key)}
                          className="size-4 accent-navy"
                        />
                        {c.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Model Tier" open={open.tier} onToggle={() => setOpen((o) => ({ ...o, tier: !o.tier }))}>
                <ul className="flex flex-col gap-3">
                  {TIERS.map((t) => (
                    <li key={t.slug}>
                      <label className="flex cursor-pointer items-center gap-3 text-body-sm text-muted">
                        <input
                          type="checkbox"
                          checked={tiers.includes(t.slug)}
                          onChange={() => setTiers((l) => toggle(l, t.slug))}
                          className="size-4 rounded-[4px] accent-navy"
                        />
                        {t.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Price Range" open={open.price} onToggle={() => setOpen((o) => ({ ...o, price: !o.price }))}>
                <input
                  type="range"
                  min={0}
                  max={PRICE_MAX}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  aria-label="Maximum price"
                  aria-valuetext={formatINR(maxPrice)}
                  style={{ ["--pct" as string]: `${pct}%` }}
                  className="price-range mt-2 w-full"
                />
                <div className="mt-3 flex items-center justify-between text-body-sm text-charcoal">
                  <span>{formatINR(0)}</span>
                  <span>{maxPrice >= PRICE_MAX ? `${formatINR(PRICE_MAX)}+` : `Up to ${formatINR(maxPrice)}`}</span>
                </div>
              </Section>

              <Section title="Colour" open={open.colour} onToggle={() => setOpen((o) => ({ ...o, colour: !o.colour }))}>
                <ul className="flex flex-col gap-2">
                  {COLOURS.map((c) => {
                    const on = colours.includes(c.key);
                    return (
                      <li key={c.key}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => setColours((l) => toggle(l, c.key))}
                          className="flex items-center gap-3 text-body-sm text-muted hover:text-charcoal"
                        >
                          <span
                            aria-hidden
                            className={cn("size-[22px] rounded-full border-2 border-white", on ? "ring-2 ring-navy" : "ring-1 ring-line")}
                            style={{ background: c.dot }}
                          />
                          <span className={cn(on && "font-bold text-charcoal")}>{c.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Section>

              <div className="bg-navy px-6 py-7 text-center text-white">
                <p className="font-jakarta text-[22px]/8 font-bold text-white">Need help?</p>
                <p className="mt-2 text-body-sm text-white">We assist with product fit, pricing, installation, and more.</p>
                <ButtonLink href="/contact-us" variant="dark" className="mt-5 h-[50px] w-full">
                  Contact our team
                </ButtonLink>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="min-w-0">
          {showcase.length === 0 ? (
            <div className="rounded-[32px] border border-line bg-card p-8 text-center" role="status">
              <p className="font-jakarta text-[22px]/8 font-bold">
                {category === "gps" ? "GPS trackers are coming soon." : "No products match your filters."}
              </p>
              <button type="button" onClick={clear} className="mt-4 font-bold text-navy underline underline-offset-4">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <ul className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Products">
                {showcase.map((p) => (
                  <li key={`s-${p.slug}`} className="h-full">
                    <ShowcaseCard product={p} clamp variant="listing" />
                  </li>
                ))}
              </ul>
              {detail.length > 0 && (
                <ul className="mt-6 grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Products with specifications">
                  {detail.map((p) => (
                    <li key={`d-${p.slug}`} className="h-full">
                      <DetailCard product={p} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-[40px] bg-charcoal px-8 py-8 text-white md:flex-row md:items-center">
            <div className="max-w-[560px]">
              <h2 className="font-jakarta text-[24px]/8 font-bold text-white">Compare the right capacity for your facility.</h2>
              <p className="mt-3 text-body text-muted-dark">
                Review daily capacity, power, weight and pricing across the three incinerator models.
              </p>
            </div>
            <ButtonLink href="/compare-models" variant="dark" className="h-[52px] shrink-0 px-8">
              Compare models
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
