import Link from "next/link";
import {
  FOOTER_POLICIES,
  FOOTER_STRIP,
  FOOTER_SUPPORT,
  FOOTER_TAGLINE,
  HOME_FOOTER_STRIP,
  HOME_FOOTER_TAGLINE,
} from "@/lib/constants";
import { getProducts } from "@/lib/data/content";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";

function Column({ title, small, children }: { title: string; small: boolean; children: React.ReactNode }) {
  return (
    <div>
      <h2 className={cn("font-sans font-normal tracking-wide text-muted-dark uppercase", small ? "pt-[5px] text-[11px]/4" : "text-label")}>{title}</h2>
      <ul className={cn("flex flex-col", small ? "mt-3.5 gap-4" : "mt-4 gap-3")}>{children}</ul>
    </div>
  );
}

/**
 * Site footer. The Home design uses different copy and slightly smaller type with fixed column
 * positions (x = 130 / 546 / 852 / 1131), so it is a variant rather than a separate component.
 */
export async function Footer({ variant = "default" }: { variant?: "default" | "home" } = {}) {
  const products = await getProducts();
  const home = variant === "home";
  const tagline = home ? HOME_FOOTER_TAGLINE : FOOTER_TAGLINE;
  const strip = home ? HOME_FOOTER_STRIP : FOOTER_STRIP;
  const link = cn("whitespace-nowrap text-white transition hover:underline underline-offset-4", home ? "block text-[12px]/4" : "text-body-sm");

  return (
    <footer className="bg-charcoal text-white">
      <div className={cn("mx-auto w-full max-w-(--container-page) px-5 sm:px-8 xl:px-0", home ? "pt-11 pb-[14px]" : "pt-14 pb-10")}>
        <div
          className={cn(
            "grid gap-10 sm:grid-cols-2",
            home ? "lg:grid-cols-[416px_306px_279px_1fr] lg:gap-x-0" : "lg:grid-cols-[minmax(0,1.5fr)_1fr_1fr_auto] lg:gap-x-12",
          )}
        >
          <div>
            <p className="font-heading text-title font-extrabold text-white">RMAX Solutions</p>
            <p className={cn("mt-2 text-white", home ? "text-[12px]" : "text-body-sm")}>{tagline}</p>
          </div>
          <Column title="Our Products" small={home}>
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={home ? `/products/${p.slug}` : "/compare-models"} className={link}>
                  {p.name} · {formatINR(p.price)}
                </Link>
              </li>
            ))}
          </Column>
          <Column title="Support" small={home}>
            {FOOTER_SUPPORT.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>
          <Column title="Policies" small={home}>
            {FOOTER_POLICIES.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>
        </div>
        <div className="mt-10 border-t border-white/20 pt-8 text-label text-white">{strip.join(" · ")}</div>
      </div>
    </footer>
  );
}
