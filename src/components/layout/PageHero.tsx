import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";
import { cn } from "@/lib/cn";

export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-body-sm">
      <Link href="/" className="text-muted transition hover:text-navy">
        Home
      </Link>
      <ChevronRight aria-hidden className="size-4 text-muted" />
      <span aria-current="page" className="text-navy">
        {current}
      </span>
    </nav>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-label font-extrabold tracking-wide text-navy uppercase", className)}>{children}</p>;
}

/** Breadcrumb → eyebrow → H1 → lead, as on every content page. */
export function PageHero({
  breadcrumb,
  eyebrow,
  title,
  lead,
  className,
}: {
  breadcrumb?: string;
  eyebrow: string;
  title: string;
  lead?: React.ReactNode;
  className?: string;
}) {
  return (
    <Container className={cn("pt-6 md:pt-8", className)}>
      {breadcrumb && <Breadcrumb current={breadcrumb} />}
      <Eyebrow className={breadcrumb ? "mt-5" : undefined}>{eyebrow}</Eyebrow>
      <h1 className="mt-3 text-display-sm md:text-display">{title}</h1>
      {lead && <p className="mt-5 max-w-[880px] text-body text-muted">{lead}</p>}
    </Container>
  );
}
