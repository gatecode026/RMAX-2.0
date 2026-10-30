"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
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
  { key: "blue", label: "Blue", dot: "#315B96" },
  { key: "pink", label: "Pink", dot: "#FFC0CB" },
  { key: "off-white", label: "Off-White", dot: "#FFE188" },
  { key: "red", label: "Red", dot: "#FA5858" },
];

const PRICE_MAX = 15000;
const PRICE_DEFAULT = 8550; // the design's slider rests at ~57 %

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Sort by: Featured" },
  { value: "price-asc", label: "Sort by: Price, low to high" },
  { value: "price-desc", label: "Sort by: Price, high to low" },
  { value: "name", label: "Sort by: Name" },
];

function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (val: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const currentOption = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort products"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-[214px] items-center justify-between rounded-[14px] border border-line bg-card px-4 text-[13px] font-semibold text-charcoal transition-all",
          "hover:border-navy/40 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-navy/20",
          open && "border-navy ring-2 ring-navy/20"
        )}
      >
        <span className="truncate">{currentOption.label}</span>
        <ChevronDown
          aria-hidden
          className={cn("size-4 text-charcoal transition-transform duration-200", open && "rotate-180 text-navy")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort options"
          className="absolute right-0 top-full mt-1.5 z-50 w-[220px] rounded-[16px] border border-line bg-card p-1.5 shadow-[0_12px_36px_rgba(0,41,112,0.12)] animate-in fade-in zoom-in-95 duration-150"
        >
          {SORT_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between rounded-[10px] px-3.5 py-2.5 text-[13px] transition-colors cursor-pointer",
                  isSelected
                    ? "bg-soft font-bold text-navy"
                    : "font-medium text-charcoal hover:bg-soft/70 hover:text-navy"
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="size-4 text-navy shrink-0 ml-2" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Accordion section — styled according to Figma reference */
function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children?: React.ReactNode }) {
  const id = useId();
  return (
    <div className="border-t border-[#D6DCE4] px-4 py-5 sm:py-6 flex flex-col gap-4">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex w-full items-center justify-between text-left cursor-pointer"
        >
          <span className="font-heading text-[16px] font-extrabold leading-[22px] text-[#232A32]">
            {title}
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 text-[#232A32] stroke-[2.5] transition-transform duration-200",
              open ? "rotate-0" : "-rotate-90",
            )}
          />
        </button>
      </h3>
      {open && (
        <div id={id} className="px-1 flex flex-col gap-3">
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
  const [open, setOpen] = useState({ type: true, tier: true, price: true, colour: true });
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

  const cards = useMemo(() => {
    const list: { key: string; product: ProductDTO; type: "showcase" | "detail" }[] = [];
    visible.forEach((p) => {
      list.push({ key: `s-${p.slug}`, product: p, type: "showcase" });
    });
    const incinerators = visible.filter((p) => p.category === "incinerator");
    incinerators.forEach((p) => {
      list.push({ key: `d-${p.slug}`, product: p, type: "detail" });
    });
    return list;
  }, [visible]);

  const filtersActive = tiers.length > 0 || colours.length > 0 || maxPrice !== PRICE_DEFAULT || category !== "all";
  const pct = (maxPrice / PRICE_MAX) * 100;

  return (
    <div className="mx-auto w-full max-w-(--container-page) px-5 sm:px-8 lg:px-8 xl:px-16">
      {/* Category pills + sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Product category" className="flex flex-wrap gap-2.5 sm:gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={category === c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "h-10 rounded-full border px-4 sm:px-5 text-body-sm font-semibold transition",
                category === c.key ? "border-navy bg-navy text-white" : "border-line bg-card text-charcoal hover:border-navy",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      <div className="mt-5 sm:mt-6 grid items-start gap-6 lg:grid-cols-[302px_1fr] xl:gap-8">
        {/* Filters */}
        <aside
          aria-label="Filters"
          className="lg:sticky lg:top-6 w-full lg:w-[302px] shrink-0"
        >
          <button
            type="button"
            className="flex h-12 w-full items-center justify-between rounded-input border border-[#D6DCE4] bg-[#FBF9F5] px-5 font-bold text-[#232A32] lg:hidden"
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
            <div className="w-full lg:w-[302px] max-h-[calc(100vh-48px)] overflow-y-auto overscroll-contain rounded-[16px] border border-[#D6DCE4] bg-[#FBF9F5] flex flex-col pt-3 shadow-2xs">
              {/* Frame 168: Title & Clear all */}
              <div className="flex h-12 w-full items-center justify-between px-4 py-3 shrink-0">
                <h2 className="font-heading text-[20px] font-extrabold leading-6 text-[#232A32]">
                  Filters
                </h2>
                {filtersActive && (
                  <button
                    type="button"
                    onClick={clear}
                    className="font-sans text-[12px] font-bold leading-5 text-[#002970] underline underline-offset-2 hover:opacity-80 cursor-pointer"
                  >
                    clear all
                  </button>
                )}
              </div>

              {/* Product Type (with "All solutions" default selected) */}
              <Section title="Product Type" open={open.type} onToggle={() => setOpen((o) => ({ ...o, type: !o.type }))}>
                <ul className="flex flex-col gap-3">
                  {CATEGORIES.map((c) => {
                    const isSelected = category === c.key;
                    return (
                      <li key={c.key}>
                        <label className="flex cursor-pointer items-center gap-3 select-none group">
                          <input
                            type="radio"
                            name="product-type"
                            value={c.key}
                            checked={isSelected}
                            onChange={() => setCategory(c.key)}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              "size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors bg-[#FDFDFD]",
                              isSelected ? "border-[#002970]" : "border-[#D6DCE4] group-hover:border-slate-400",
                            )}
                          >
                            {isSelected && <span className="size-2.5 rounded-full bg-[#002970]" />}
                          </span>
                          <span
                            className={cn(
                              "text-[14px] leading-6 transition-colors",
                              isSelected
                                ? "font-extrabold text-[#002970]"
                                : "font-normal text-[#586574] group-hover:text-[#232A32]",
                            )}
                          >
                            {c.label}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </Section>

              {/* Model Tier */}
              <Section title="Model Tier" open={open.tier} onToggle={() => setOpen((o) => ({ ...o, tier: !o.tier }))}>
                <ul className="flex flex-col gap-3">
                  {TIERS.map((t) => {
                    const isChecked = tiers.includes(t.slug);
                    return (
                      <li key={t.slug}>
                        <label className="flex cursor-pointer items-center gap-3 select-none group">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setTiers((l) => toggle(l, t.slug))}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              "size-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors bg-[#FDFDFD]",
                              isChecked ? "border-[#002970] bg-[#002970]" : "border-[#D6DCE4] group-hover:border-slate-400",
                            )}
                          >
                            {isChecked && <Check className="size-3 text-white stroke-[3]" />}
                          </span>
                          <span
                            className={cn(
                              "text-[14px] leading-6 transition-colors",
                              isChecked
                                ? "font-bold text-[#002970]"
                                : "font-normal text-[#586574] group-hover:text-[#232A32]",
                            )}
                          >
                            {t.label}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </Section>

              {/* Price Range */}
              <Section title="Price Range" open={open.price} onToggle={() => setOpen((o) => ({ ...o, price: !o.price }))}>
                <div className="flex flex-col gap-3">
                  <div className="py-1">
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
                      className="price-range w-full cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[18px] font-medium leading-7 text-[#181D27]">
                    <span>{formatINR(0)}</span>
                    <span>{maxPrice >= PRICE_MAX ? `${formatINR(PRICE_MAX)}+` : formatINR(maxPrice)}</span>
                  </div>
                </div>
              </Section>

              {/* Colour */}
              <Section title="Colour" open={open.colour} onToggle={() => setOpen((o) => ({ ...o, colour: !o.colour }))}>
                <ul className="flex flex-col gap-3">
                  {COLOURS.map((c) => {
                    const isSelected = colours.includes(c.key);
                    return (
                      <li key={c.key}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setColours((l) => toggle(l, c.key))}
                          className="flex items-center gap-3 text-left cursor-pointer group"
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "size-6 rounded-full flex items-center justify-center transition-all",
                              isSelected ? "ring-2 ring-[#002970] ring-offset-2 scale-105" : "hover:scale-105",
                            )}
                            style={{ background: c.dot }}
                          >
                            {isSelected && <span className="size-2 rounded-full bg-white shadow-xs" />}
                          </span>
                          <span
                            className={cn(
                              "text-[14px] leading-6 transition-colors",
                              isSelected
                                ? "font-bold text-[#002970]"
                                : "font-normal text-[#586574] group-hover:text-[#232A32]",
                            )}
                          >
                            {c.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Section>

              {/* Navy Support Concierge */}
              <div className="mt-auto bg-[#002970] p-5 sm:p-5 flex flex-col items-center gap-5 text-center text-white shrink-0">
                <div className="flex flex-col items-center gap-2">
                  <p className="font-heading text-[24px] font-extrabold leading-8 tracking-[-0.6px] text-[#FDFDFD]">
                    Need help?
                  </p>
                  <p className="text-[16px] font-normal leading-6 text-[#FDFDFD]/90">
                    We assist with product fit, pricing, installation, and more.
                  </p>
                </div>
                <ButtonLink
                  href="/contact-us"
                  className="h-11 w-full max-w-[270px] rounded-[32px] bg-[#FDFDFD] px-5 py-3 text-center text-[16px] font-bold leading-5 text-[#002970] hover:bg-white/90 shadow-xs transition-colors"
                >
                  Contact our team
                </ButtonLink>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="min-w-0">
          {cards.length === 0 ? (
            <div className="rounded-[32px] border border-line bg-card p-8 text-center" role="status">
              <p className="font-heading text-title font-extrabold">
                {category === "gps" ? "GPS trackers are coming soon." : "No products match your filters."}
              </p>
              <button type="button" onClick={clear} className="mt-4 font-bold text-navy underline underline-offset-4">
                Clear all filters
              </button>
            </div>
          ) : (
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 xl:gap-5"
              aria-label="Products"
            >
              {cards.map((item) => (
                <li key={item.key} className="h-full">
                  {item.type === "showcase" ? (
                    <ShowcaseCard product={item.product} clamp variant="listing" />
                  ) : (
                    <DetailCard product={item.product} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
