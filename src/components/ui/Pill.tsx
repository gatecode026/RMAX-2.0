import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "soft" | "success" | "light";

const tones: Record<Tone, string> = {
  soft: "bg-soft text-navy",
  success: "bg-success-soft text-success",
  light: "bg-card text-navy", // on dark surfaces
};

/** Uppercase label chip — "50% LAUNCH OFFERS", "GUEST CHECKOUT", … */
export function Pill({ tone = "soft", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-action px-4 py-1 text-label font-extrabold tracking-wide uppercase",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Sentence-case status chip — "Preparing · Example", FAQ category chips. */
export function StatusChip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex w-fit items-center rounded-action bg-soft px-4 py-1 text-label font-extrabold text-navy", className)}
      {...props}
    />
  );
}
