import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Page container — 1180px content width at desktop (x130→1310 on a 1440 canvas). */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-(--container-page) px-5 sm:px-8 xl:px-0", className)} {...props} />;
}

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-10 md:py-16", className)} {...props} />;
}
