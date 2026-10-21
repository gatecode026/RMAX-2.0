import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "light" | "dark" | "tint";

const tones: Record<Tone, string> = {
  light: "border border-line bg-card text-charcoal shadow-card",
  dark: "bg-charcoal text-white",
  tint: "bg-soft/60 text-charcoal",
};

export function Card({
  tone = "light",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={cn("rounded-card p-7", tones[tone], className)} {...props} />;
}
