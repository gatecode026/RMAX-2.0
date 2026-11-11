"use client";

import { useState } from "react";
import { HelpCircle, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

const card = "rounded-[28px] border border-[#ECF1F8] bg-card shadow-[0_6px_24px_rgb(35_42_50/0.04)]";
const h2 = "font-heading text-title font-extrabold tracking-[-0.6px] text-charcoal";

/** Accordion-style FAQ list, styled to match the rest of the product detail page (card shell, icon chips, navy accent). */
export function ProductFaqCard({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" aria-labelledby="faqs-h" className={cn(card, "scroll-mt-20 p-7 md:p-8")}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-soft text-navy">
          <HelpCircle className="size-5" aria-hidden />
        </span>
        <h2 id="faqs-h" className={h2}>
          Frequently asked questions.
        </h2>
      </div>

      <dl className="mt-6 flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const open = openIndex === i;
          return (
            <div
              key={faq.question}
              className={cn(
                "rounded-[16px] border transition-colors",
                open ? "border-navy/20 bg-soft" : "border-line bg-card hover:border-navy/20",
              )}
            >
              <dt>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className={cn("text-body font-bold", open ? "text-navy" : "text-charcoal")}>{faq.question}</span>
                  <Plus
                    aria-hidden
                    className={cn("size-5 shrink-0 text-navy transition-transform duration-200", open && "rotate-45")}
                  />
                </button>
              </dt>
              {open && (
                <dd className="px-5 pb-4 text-body-sm leading-relaxed text-muted">
                  {faq.answer}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
