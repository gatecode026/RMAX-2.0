"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { ProductSearch } from "./ProductSearch";

type Props = {
  userName: string | null;
  /** The header design has no cart link; one appears only while the cart has items. */
  cartCount?: number;
  products: { slug: string; name: string; summary?: string }[];
};

const LINKS = [
  { label: "Our Product", href: "/our-product" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "About Us", href: "/about-us" },
] as const;

/** Home-page header: logo · product search · Our Product / Contact Us / About Us · Login. */
export function HomeHeaderView({ userName, products, cartCount = 0 }: Props) {
  const pathname = usePathname();
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenedOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const account = userName ? { href: "/account", label: userName.split(" ")[0] || "Account" } : { href: "/login", label: "Login" };

  return (
    <header className="relative z-40">
      <div className="mx-auto flex h-(--header-height) w-full max-w-(--container-home) items-center gap-6 px-5 sm:px-8 xl:px-0">
        <Logo />
        <div className="hidden min-w-0 flex-1 lg:block lg:max-w-[410px] xl:ml-[271px]">
          <ProductSearch items={products} />
        </div>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-8 lg:flex">
          <ul className="flex items-center gap-8">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-body text-muted transition hover:text-navy">
                  {l.label}
                </Link>
              </li>
            ))}
            {cartCount > 0 && (
              <li>
                <Link href="/cart" className="text-body font-bold text-navy transition hover:underline">
                  Cart · {cartCount}
                </Link>
              </li>
            )}
          </ul>
          <Link href={account.href} className={buttonClasses({ size: "xs", className: "h-[43px] min-w-20" })}>
            {account.label}
          </Link>
        </nav>
        <button
          type="button"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-full border border-line bg-card text-navy lg:hidden"
          aria-expanded={open}
          aria-controls="home-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpenedOn(open ? null : pathname)}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <nav id="home-mobile-menu" aria-label="Mobile" className="border-t border-line bg-canvas px-5 pb-6 sm:px-8 lg:hidden">
          <div className="py-4">
            <ProductSearch items={products} />
          </div>
          <ul className="flex flex-col">
            {[
              { label: "Home", href: "/" },
              ...LINKS,
              { label: cartCount > 0 ? `Cart · ${cartCount}` : "Cart", href: "/cart" },
              { label: "Help", href: "/help" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-input px-2 py-3 text-body font-semibold text-charcoal">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={account.href} className={buttonClasses({ size: "sm", className: "mt-3 w-full" })}>
            {account.label}
          </Link>
        </nav>
      )}
    </header>
  );
}
