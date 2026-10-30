"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Item = { slug: string; name: string; summary?: string };

/** "Search products" field from the Home header: type to see matching models, click or Enter opens the product page. */
export function ProductSearch({ items, className }: { items: Item[]; className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const q = query.trim().toLowerCase();
  const matches = q
    ? items.filter((i) => `${i.name} ${i.summary ?? ""} napkin incinerator vending pad`.toLowerCase().includes(q))
    : [];
  const open = focused && q.length > 0;

  // Reset selected index when matches change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [q]);

  // Reliable outside-click closing
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (slug: string) => {
    setFocused(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(`/products/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setFocused(false);
      return;
    }

    if (!open || matches.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetSlug = selectedIndex >= 0 && selectedIndex < matches.length
        ? matches[selectedIndex].slug
        : matches[0].slug;
      handleSelect(targetSlug);
    }
  };

  return (
    <form
      ref={containerRef}
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (matches.length > 0) {
          const targetSlug = selectedIndex >= 0 && selectedIndex < matches.length
            ? matches[selectedIndex].slug
            : matches[0].slug;
          handleSelect(targetSlug);
        } else {
          router.push("/our-product");
          setFocused(false);
        }
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search products
      </label>
      <div className="flex h-[42px] xl:h-[44px] items-center gap-2.5 rounded-full border border-line bg-white/95 backdrop-blur-md px-4 xl:px-4.5 transition-all duration-200 focus-within:border-navy focus-within:outline-none focus-within:ring-0 shadow-xs">
        <Search aria-hidden="true" className="size-4 shrink-0 text-navy" />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products"
          autoComplete="off"
          className="w-full bg-transparent text-[13.5px] leading-none text-charcoal placeholder:text-muted placeholder:text-[13.5px] focus:outline-none"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFocused(false);
              inputRef.current?.focus();
            }}
            className="p-1 text-muted hover:text-charcoal cursor-pointer"
            aria-label="Clear search"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          onMouseDown={(e) => {
            // Prevent search input from blurring when clicking inside dropdown
            e.preventDefault();
          }}
          className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 overflow-hidden rounded-2xl border border-line bg-card py-2 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {matches.length === 0 ? (
            <li className="px-5 py-3 text-body-sm text-muted">No matching products found</li>
          ) : (
            matches.map((m, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <li key={m.slug} role="option" aria-selected={isSelected}>
                  <Link
                    href={`/products/${m.slug}`}
                    onMouseDown={(e) => {
                      // Prevent blur so click always registers reliably
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelect(m.slug);
                    }}
                    className={cn(
                      "block px-5 py-3 text-body-sm transition-colors cursor-pointer select-none",
                      isSelected ? "bg-soft text-navy" : "hover:bg-soft text-charcoal"
                    )}
                  >
                    <span className="font-bold block text-charcoal">
                      {m.name.includes("Machine") || m.name.includes("Vending")
                        ? m.name
                        : `Napkin Incinerator Machine (${m.name})`}
                    </span>
                    {m.summary && (
                      <span className="mt-0.5 block text-xs text-muted line-clamp-1">
                        {m.summary}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      )}
    </form>
  );
}
