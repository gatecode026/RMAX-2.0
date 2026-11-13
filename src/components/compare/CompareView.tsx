"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, Check, Search } from "lucide-react";
import { BuyButton } from "@/components/sections/BuyButton";
import { formatINR } from "@/lib/format";
import { SPEC_ROWS } from "@/lib/specs";
import { cn } from "@/lib/cn";
import type { ProductDTO } from "@/lib/data/content";

interface CompareViewProps {
  allProducts: ProductDTO[];
  initialSelectedSlugs?: string[];
}

const DEFAULT_FALLBACK_SLUGS = [
  "sanitary-pad-disposal-machine-100-pad",
  "sanitary-pad-disposal-machine",
  "sanitary-pad-disposal-machine-500-pad",
];

const SLUG_ALIASES: Record<string, string> = {
  basic: "sanitary-pad-disposal-machine-100-pad",
  pro: "sanitary-pad-disposal-machine",
  "pro-max": "sanitary-pad-disposal-machine-500-pad",
};

/** Matches studio card images or falls back to product image */
const COMPARE_IMAGES: Record<string, string> = {
  basic: "/images/home/card-basic.png",
  pro: "/images/home/card-pro.png",
  "pro-max": "/images/home/card-pro-max.png",
  "sanitary-pad-disposal-machine-100-pad": "/images/home/card-basic.png",
  "sanitary-pad-disposal-machine": "/images/home/card-pro.png",
  "sanitary-pad-disposal-machine-500-pad": "/images/home/card-pro-max.png",
};

function ModelDropdown({
  colIndex,
  currentSlug,
  allProducts,
  onSelect,
}: {
  colIndex: number;
  currentSlug: string;
  allProducts: ProductDTO[];
  onSelect: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentProduct = allProducts.find((p) => p.slug === currentSlug);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      inputRef.current?.focus();
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filtered = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative mb-3" ref={dropdownRef}>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#62748E] mb-1">
        Select Model {colIndex + 1}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "w-full flex items-center justify-between gap-2 rounded-[12px] border bg-white py-2 pl-3 pr-2.5 font-sans text-[13px] font-semibold text-[#0F172A] shadow-xs transition-all text-left cursor-pointer",
          open ? "border-[#0B62FF] ring-2 ring-[#0B62FF]/15" : "border-[#CBD5E1] hover:border-[#94A3B8]"
        )}
      >
        <span className="truncate">{currentProduct?.name || "Choose a product"}</span>
        <ChevronDown className={cn("size-4 text-[#64748B] shrink-0 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] rounded-[16px] border border-[#E2E8F0] bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
          <div className="relative mb-1.5 px-1 pt-1">
            <Search className="absolute left-3.5 top-3.5 size-3.5 text-[#94A3B8]" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 26 models..."
              className="w-full rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-8 pr-3 text-[12px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#0B62FF] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="max-h-[260px] overflow-y-auto space-y-0.5 pr-1">
            {filtered.length === 0 ? (
              <p className="p-3 text-center text-[12px] text-[#94A3B8]">No matching models</p>
            ) : (
              filtered.map((prod) => {
                const isSelected = prod.slug === currentSlug;
                return (
                  <button
                    key={prod.slug}
                    type="button"
                    onClick={() => {
                      onSelect(prod.slug);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left transition-colors cursor-pointer text-[12.5px]",
                      isSelected
                        ? "bg-[#EFF6FF] text-[#0B62FF] font-bold"
                        : "text-[#1E293B] hover:bg-[#F1F5F9] font-medium"
                    )}
                  >
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="truncate leading-tight">{prod.name}</span>
                      <span className="text-[10.5px] text-[#64748B] font-semibold mt-0.5">
                        {prod.price > 0 ? formatINR(prod.price) : "Price on request"}
                      </span>
                    </div>
                    {isSelected && <Check className="size-4 text-[#0B62FF] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CompareView({
  allProducts,
  initialSelectedSlugs = DEFAULT_FALLBACK_SLUGS,
}: CompareViewProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() => {
    const raw = initialSelectedSlugs.length > 0 ? initialSelectedSlugs : DEFAULT_FALLBACK_SLUGS;
    const resolved = raw.map((s) => SLUG_ALIASES[s] || s);
    const result: string[] = [];
    for (let i = 0; i < 3; i++) {
      const candidate = resolved[i] || DEFAULT_FALLBACK_SLUGS[i];
      const exists = allProducts.some((p) => p.slug === candidate);
      result.push(exists ? candidate : DEFAULT_FALLBACK_SLUGS[i] || allProducts[i]?.slug || "");
    }
    return result;
  });

  const handleModelChange = (colIndex: number, newSlug: string) => {
    const next = [...selectedSlugs];
    next[colIndex] = newSlug;
    setSelectedSlugs(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("models", next.join(","));
      window.history.replaceState({}, "", url.toString());
    }
  };

  const models = selectedSlugs
    .map((slug, idx) => {
      return (
        allProducts.find((p) => p.slug === slug) ||
        allProducts.find((p) => p.slug === DEFAULT_FALLBACK_SLUGS[idx]) ||
        allProducts[idx % allProducts.length]
      );
    })
    .filter((p): p is ProductDTO => p !== undefined);

  return (
    <div className="w-full">
      {/* Page introduction matching Figma 02 Compare Models */}
      <div className="flex flex-col items-start gap-4.5 pt-2 pb-8 sm:pb-10">
        {/* Breadcrumb trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-sans text-[14px]">
          <Link href="/" className="text-[#64748B] hover:text-[#0B62FF] transition-colors">
            Home
          </Link>
          <ChevronRight className="size-4 text-[#64748B]" aria-hidden="true" />
          <span className="font-sans text-[12px] font-normal leading-4 text-[#0B62FF]" aria-current="page">
            Compare Models
          </span>
        </nav>

        {/* Eyebrow */}
        <p className="font-sans text-[12px] font-extrabold leading-4 tracking-wider text-[#0B62FF] uppercase">
          COMPARE MODELS
        </p>

        {/* Heading & Description */}
        <div className="flex flex-col items-start gap-3.5 max-w-[940px]">
          <h1 className="font-jakarta text-[32px]/[38px] sm:text-[42px]/[48px] md:text-[52px]/[60px] font-extrabold tracking-[-1.5px] text-[#020618]">
            Choose with confidence.
          </h1>
          <p className="font-sans text-[15px] sm:text-[16px]/[28px] text-[#62748E]">
            Capacity, power and launch pricing at a glance. Match the model to the expected daily usage of your institution.
          </p>
        </div>
      </div>

      {/* Comparison table card matching exact Figma layout */}
      <div className="overflow-hidden rounded-[30px] border border-[#E2E8F0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <div className="min-w-[1180px]">
            {/* Model headers (1180px width, padding 24px, gap 24px) */}
            <div className="grid grid-cols-[220px_280px_280px_280px] items-end gap-6 p-6">
              {/* Comparison guide (left 220px column) */}
              <div className="flex flex-col justify-end gap-4 pb-1">
                <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3.5 py-1.5 font-sans text-[12px] font-extrabold leading-4 tracking-wider text-[#0B62FF] uppercase self-start">
                  50% LAUNCH OFFERS
                </span>
                <h2 className="font-jakarta text-[24px]/[28px] font-extrabold text-[#020618]">
                  Find your fit.
                </h2>
                <p className="font-sans text-[14px]/[23px] text-[#62748E]">
                  Select any models from our complete catalogue to compare features, pricing and specifications.
                </p>
              </div>

              {/* 3 Model columns (280px each) */}
              {models.map((p, colIndex) => {
                const imgSrc = p.image?.src || p.cardImage?.src || COMPARE_IMAGES[p.slug];
                return (
                  <div key={`col-${colIndex}-${p.slug}`} className="flex flex-col">
                    {/* Model Selector Custom Dropdown */}
                    <ModelDropdown
                      colIndex={colIndex}
                      currentSlug={p.slug}
                      allProducts={allProducts}
                      onSelect={(newSlug) => handleModelChange(colIndex, newSlug)}
                    />

                    {/* Product Image */}
                    <Link
                      href={`/products/${p.slug}`}
                      className="group relative block h-[190px] w-full overflow-hidden rounded-[24px] bg-[#F1F5F9] hover:opacity-95 transition-opacity"
                    >
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={p.name}
                          fill
                          sizes="280px"
                          priority
                          unoptimized={imgSrc.startsWith("http")}
                          className="size-full object-cover rounded-[24px] group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center bg-[#F1F5F9] p-4 text-center rounded-[24px]">
                          <span className="font-jakarta text-[15px] font-bold text-[#0F172A] line-clamp-2">{p.name}</span>
                          <span className="mt-1 font-sans text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Photo coming soon</span>
                        </div>
                      )}
                    </Link>

                    {/* Heading */}
                    <h3 className="mt-3.5 font-jakarta text-[22px]/[26px] font-extrabold text-[#020618] line-clamp-2 min-h-[52px]">
                      <Link href={`/products/${p.slug}`} className="hover:text-[#0B62FF] transition-colors">
                        {p.name}
                      </Link>
                    </h3>

                    {/* Price and Original Price */}
                    <div className="mt-2 flex flex-col">
                      <p className="font-jakarta text-[26px]/[32px] font-extrabold text-[#020618]">
                        {p.price > 0 ? formatINR(p.price) : "Price on request"}
                      </p>
                      {p.originalPrice > p.price && p.price > 0 ? (
                        <p className="font-sans text-[13px]/[18px] text-[#62748E] line-through">
                          {formatINR(p.originalPrice)}
                        </p>
                      ) : (
                        <div className="h-[18px]" />
                      )}
                    </div>

                    {/* Actions: Buy this model & Request quote */}
                    <div className="mt-3.5 flex flex-col gap-2.5">
                      <BuyButton
                        slug={p.slug}
                        className="w-full"
                        buttonClassName="h-[50px] w-full rounded-full bg-gradient-to-r from-[#0B62FF] to-[#0EA5E9] font-sans text-[14px] font-bold text-white shadow-xs hover:opacity-95 transition-opacity"
                      />
                      <Link
                        href={`/institutional-quote?model=${p.slug}`}
                        className="flex h-[50px] w-full items-center justify-center rounded-full bg-white border border-[rgba(11,98,255,0.18)] font-sans text-[14px] font-bold text-[#0B62FF] hover:bg-[#F0F5FF] transition-colors"
                      >
                        Request quote
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alternating Specification Rows (h-[57px], padding 18px 24px, gap 24px) */}
            <div className="flex flex-col">
              {SPEC_ROWS.map((row, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={row.key}
                    className={cn(
                      "grid grid-cols-[220px_280px_280px_280px] items-center gap-6 px-6 h-[57px]",
                      isEven ? "bg-[#EFF6FF]" : "bg-white"
                    )}
                  >
                    <div className="font-sans font-bold text-[14px] leading-[19px] text-[#0F172A]">
                      {row.label}
                    </div>
                    {models.map((p, colIdx) => (
                      <div
                        key={`${p.slug}-${colIdx}-${row.key}`}
                        className="font-sans font-normal text-[14px] leading-[21px] text-[#62748E] truncate"
                      >
                        {p.specs?.[row.key] || "—"}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Support callout matching exact Figma specs */}
      <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-10 rounded-[38px] bg-[#020618] p-6 sm:p-9 text-white">
        <div className="flex-1 max-w-[838px]">
          <h2 className="font-jakarta text-[22px] sm:text-[24px]/[28px] font-extrabold text-white">
            Not sure which capacity you need?
          </h2>
          <p className="mt-2 sm:mt-3 font-sans text-[14px] sm:text-[16px]/[28px] text-[#CAD5E2]">
            Share your institution type, daily usage and number of washrooms. Our team can help with model selection and installation planning.
          </p>
        </div>
        <Link
          href="/institutional-quote"
          className="inline-flex h-[50px] shrink-0 items-center justify-center rounded-full bg-white border border-[rgba(11,98,255,0.18)] px-6 sm:px-8 font-sans text-[14px] font-bold text-[#0B62FF] hover:bg-[#F0F5FF] transition-colors whitespace-nowrap self-stretch sm:self-auto text-center"
        >
          Request institutional quote
        </Link>
      </div>
    </div>
  );
}