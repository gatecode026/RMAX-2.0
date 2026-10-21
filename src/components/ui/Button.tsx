import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "dark" | "charcoal";
type Size = "xs" | "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-action font-bold leading-5 transition " +
  "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-linear-to-r from-navy to-navy-600 text-white hover:brightness-110 active:brightness-95",
  secondary: "border border-line bg-card text-navy hover:border-navy hover:bg-soft active:bg-soft",
  outline: "border border-navy bg-transparent text-navy hover:bg-navy hover:text-white active:bg-navy active:text-white",
  ghost: "text-navy hover:bg-soft active:bg-soft",
  charcoal: "bg-charcoal text-white hover:bg-navy active:bg-navy", // compact "View" buttons
  dark: "bg-card text-navy hover:bg-soft active:bg-soft", // light button on charcoal surfaces
};

const sizes: Record<Size, string> = {
  xs: "h-9 px-4 text-body-sm",
  sm: "h-11 px-6 text-body",
  md: "h-13 px-7 text-body",
};

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
