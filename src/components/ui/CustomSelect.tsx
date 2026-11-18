"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CustomSelectOption {
  value: string;
  label: string;
  colorDot?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | CustomSelectOption)[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className,
  triggerClassName,
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selected = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
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

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "group flex w-full items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left text-xs text-slate-800 shadow-xs transition hover:border-[#10469B]/50 focus:border-[#10469B] focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-[#10469B] ring-2 ring-[#10469B]/10",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {selected?.colorDot && (
            <span className={cn("size-2 shrink-0 rounded-full", selected.colorDot)} />
          )}
          <span className="truncate">
            {selected ? selected.label : <span className="text-slate-400">{placeholder}</span>}
          </span>
        </div>
        <div className="flex items-center pl-1 shrink-0">
          <ChevronDown
            className={cn(
              "size-4 text-slate-400 transition-transform duration-200 group-hover:text-[#10469B]",
              open && "rotate-180 text-[#10469B]"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-[200px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="max-h-60 overflow-y-auto space-y-0.5 [scrollbar-width:thin]">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition cursor-pointer",
                    isSelected
                      ? "bg-[#10469B]/10 font-bold text-[#10469B]"
                      : "font-medium text-slate-700 hover:bg-[#F4F7FC] hover:text-[#10469B]"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    {opt.colorDot && (
                      <span className={cn("size-2 shrink-0 rounded-full", opt.colorDot)} />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="size-3.5 shrink-0 text-[#10469B] ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
