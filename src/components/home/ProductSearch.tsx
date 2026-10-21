"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

type Item = { slug: string; name: string; summary?: string };

/** "Search products" field from the Home header: type to see matching models, Enter opens the comparison. */
export function ProductSearch({ items, className }: { items: Item[]; className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const listId = useId();

  const q = query.trim().toLowerCase();
  const matches = q ? items.filter((i) => `${i.name} ${i.summary ?? ""} napkin incinerator`.toLowerCase().includes(q)) : [];
  const open = focused && q.length > 0;

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        router.push("/compare-models");
        setFocused(false);
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search products
      </label>
      <div className="flex h-[46px] items-center gap-3 rounded-full border border-line bg-card px-5 shadow-[0_1px_2px_rgb(35_42_50/0.04)] focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/20">
        <Search aria-hidden className="size-[18px] shrink-0 text-charcoal" />
        <input
          id={`${listId}-input`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => e.key === "Escape" && setFocused(false)}
          placeholder="Search products"
          autoComplete="off"
          className="w-full bg-transparent text-body text-charcoal placeholder:text-muted focus:outline-none"
        />
      </div>
      {open && (
        <ul
          id={listId}
          className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 overflow-hidden rounded-input border border-line bg-card py-2 shadow-card"
        >
          {matches.length === 0 ? (
            <li className="px-5 py-3 text-body-sm text-muted">No matching products</li>
          ) : (
            matches.map((m) => (
              <li key={m.slug}>
                <Link href="/compare-models" className="block px-5 py-3 text-body-sm hover:bg-soft">
                  <span className="font-bold text-charcoal">Napkin Incinerator Machine ({m.name})</span>
                  {m.summary && <span className="mt-0.5 block text-label text-muted">{m.summary}</span>}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </form>
  );
}
