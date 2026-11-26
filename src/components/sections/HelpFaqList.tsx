"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { StatusChip } from "@/components/ui/Pill";

type Faq = { _id: string; category: string; question: string; answer: string };

/** Help-page FAQs grouped by category (one chip per category): all closed at first, one open at a time. A #category link in the sidebar opens that category's first question. */
export function HelpFaqList({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fromHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const match = faqs.find((f) => f.category.toLowerCase() === hash);
      if (match) setOpenId(match._id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [faqs]);

  const groups = faqs.reduce<{ category: string; items: Faq[] }[]>((acc, f) => {
    const g = acc.find((x) => x.category === f.category);
    if (g) g.items.push(f);
    else acc.push({ category: f.category, items: [f] });
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => (
        <section key={g.category} id={g.category.toLowerCase()} aria-label={`${g.category} help`} className="scroll-mt-28">
          <StatusChip>{g.category}</StatusChip>
          <div className="mt-3 flex flex-col gap-3">
            {g.items.map((f) => {
              const open = openId === f._id;
              return (
            <div key={f._id} className="overflow-hidden rounded-input border border-line bg-card">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`help-faq-${f._id}`}
                onClick={() => setOpenId(open ? null : f._id)}
                className="flex w-full cursor-pointer touch-manipulation items-center justify-between gap-4 px-5 py-4 text-left text-body font-semibold text-charcoal [-webkit-tap-highlight-color:transparent]"
              >
                <span className="min-w-0 font-sans text-body font-medium">{f.question}</span>
                <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-charcoal">
                  {open ? <X className="size-4" /> : <Plus className="size-4" />}
                </span>
              </button>
              <div id={`help-faq-${f._id}`} className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="border-t border-line bg-canvas px-5 py-4 text-body text-muted">{f.answer}</p>
                </div>
              </div>
            </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
