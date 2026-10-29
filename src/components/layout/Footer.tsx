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

/**
 * Footer variants, one per design family:
 * - "default": the original screens (uppercase column headings)
 * - "home":    the Home / catalogue screens (new copy, smaller type)
 * - "wide":    the About Us screen (sentence-case headings)
 * All variants share the page container (1280px) so the footer lines up with the header and page content.
 */
export type FooterVariant = "default" | "home" | "wide";

const CONFIG = {
  default: {
    container: "max-w-(--container-page) pt-14 pb-10",
    grid: "lg:grid-cols-[minmax(0,1.5fr)_1fr_1fr_auto] lg:gap-x-12",
    heading: "text-label tracking-wide uppercase",
    list: "mt-4 gap-3",
    link: "text-body-sm",
    tagline: "mt-2 text-body-sm",
  },
  home: {
    container: "max-w-(--container-page) pt-11 pb-[14px]",
    grid: "lg:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto] lg:gap-x-8 xl:gap-x-12",
    heading: "pt-[5px] text-[11px]/4 tracking-wide uppercase",
    list: "mt-3.5 gap-4",
    link: "block text-[12px]/4",
    tagline: "mt-2 text-[12px]",
  },
  wide: {
    container: "max-w-(--container-page) pt-[46px] pb-8",
    grid: "lg:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto] lg:gap-x-8 xl:gap-x-12",
    heading: "text-[13px]/5",
    list: "mt-[18px] gap-3",
    link: "block text-[13px]/5",
    tagline: "mt-5 text-[13px]",
    strip: "mt-[27px] pt-[33px]",
  },
} as const;

const DEFAULT_STRIP = "mt-10 pt-8";

function Column({ title, headingClass, listClass, children }: { title: string; headingClass: string; listClass: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className={cn("font-sans font-normal text-muted-dark", headingClass)}>{title}</h2>
      <ul className={cn("flex flex-col", listClass)}>{children}</ul>
    </div>
  );
}

export async function Footer({ variant = "default" }: { variant?: FooterVariant } = {}) {
  const products = await getProducts();
  const c = CONFIG[variant];
  const newCopy = variant !== "default";
  const tagline = newCopy ? HOME_FOOTER_TAGLINE : FOOTER_TAGLINE;
  const strip = newCopy ? HOME_FOOTER_STRIP : FOOTER_STRIP;
  const link = cn("whitespace-nowrap text-white transition hover:underline underline-offset-4", c.link);
  // "Our products" / "Our Products": the About design uses sentence case throughout.
  const t = (s: string) => (variant === "wide" ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);

  return (
    <footer className="w-full overflow-hidden bg-charcoal text-white">
      <div className={cn("mx-auto w-full px-5 sm:px-8 lg:px-8 xl:px-16", c.container)}>
        <div className={cn("grid gap-10 sm:grid-cols-2", c.grid)}>
          <div>
            <p className="font-heading text-title font-extrabold text-white">RMAX Solutions</p>
            <p className={cn("text-white", c.tagline)}>{tagline}</p>
          </div>
          <Column title={t("Our Products")} headingClass={c.heading} listClass={c.list}>
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={newCopy ? `/products/${p.slug}` : "/compare-models"} className={link}>
                  {p.name} · {formatINR(p.price)}
                </Link>
              </li>
            ))}
          </Column>
          <Column title={t("Support")} headingClass={c.heading} listClass={c.list}>
            {FOOTER_SUPPORT.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>
          <Column title={t("Policies")} headingClass={c.heading} listClass={c.list}>
            {FOOTER_POLICIES.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </Column>
        </div>
        <div className={cn("border-t border-white/20 text-label text-white", "strip" in c ? c.strip : DEFAULT_STRIP)}>{strip.join(" · ")}</div>
      </div>
    </footer>
  );
}
