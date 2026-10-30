"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BuyButton } from "@/components/sections/BuyButton";
import { formatINR } from "@/lib/format";
import { SPEC_ROWS } from "@/lib/specs";
import { cn } from "@/lib/cn";
import type { ProductDTO } from "@/lib/data/content";

interface CompareViewProps {
  allProducts: ProductDTO[];
  initialSelectedSlugs?: string[];
}

/** Matches the exact studio card images from the Figma reference */
const COMPARE_IMAGES: Record<string, string> = {
  basic: "/images/home/card-basic.png",
  pro: "/images/home/card-pro.png",
  "pro-max": "/images/home/card-pro-max.png",
};

export function CompareView({
  allProducts,
  initialSelectedSlugs = ["basic", "pro", "pro-max"],
}: CompareViewProps) {
  // Ensure the 3 standard incinerator models in exact order
  const targetSlugs = initialSelectedSlugs.length > 0 ? initialSelectedSlugs.slice(0, 3) : ["basic", "pro", "pro-max"];
  const models = targetSlugs
    .map((slug) => allProducts.find((p) => p.slug === slug))
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
                  All three models share enclosed operation and low maintenance.
                </p>
              </div>

              {/* 3 Model columns (280px each) */}
              {models.map((p) => {
                const imgSrc = COMPARE_IMAGES[p.slug] || p.image.src;
                return (
                  <div key={p.slug} className="flex flex-col">
                    {/* Product Image */}
                    <Link href={`/products/${p.slug}`} className="group relative block h-[190px] w-full overflow-hidden rounded-[24px] bg-[#F1F5F9] hover:opacity-95 transition-opacity">
                      <Image
                        src={imgSrc}
                        alt={p.name}
                        fill
                        sizes="280px"
                        priority
                        className="size-full object-cover rounded-[24px] group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Heading */}
                    <h3 className="mt-3.5 font-jakarta text-[24px]/[28px] font-extrabold text-[#020618]">
                      <Link href={`/products/${p.slug}`} className="hover:text-[#0B62FF] transition-colors">
                        {p.name}
                      </Link>
                    </h3>

                    {/* Price and Original Price */}
                    <div className="mt-2 flex flex-col">
                      <p className="font-jakarta text-[28px]/[35px] font-extrabold text-[#020618]">
                        {formatINR(p.price)}
                      </p>
                      {p.originalPrice > p.price ? (
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
                    {models.map((p) => (
                      <div
                        key={p.slug}
                        className="font-sans font-normal text-[14px] leading-[21px] text-[#62748E]"
                      >
                        {p.specs[row.key] || "—"}
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
