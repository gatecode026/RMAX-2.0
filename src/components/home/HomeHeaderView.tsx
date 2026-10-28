"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ProductSearch } from "./ProductSearch";
import { useAuthModal } from "@/context/AuthModalContext";

type Props = {
  userName: string | null;
  userRole?: string | null;
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
export function HomeHeaderView({ userName, userRole, products, cartCount = 0 }: Props) {
  const pathname = usePathname();
  const { openModal } = useAuthModal();
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenedOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const dashboardHref =
    userRole === "manager"
      ? "/manager/dashboard"
      : userRole === "super_admin" || userRole === "admin"
      ? "/admin/dashboard"
      : "/account";

  const dashboardLabel =
    userRole === "manager"
      ? "Manager Portal"
      : userRole === "super_admin" || userRole === "admin"
      ? "Admin Dashboard"
      : "My Account";

  const dashboardTitle = `${dashboardLabel} (${userName})`;

  return (
    <>
      {/* ========================================================
          FLOATING SEARCH BAR ON SCROLL
          Only the search bar appears when scrolled; full navbar stays at top.
          ======================================================== */}
      <div
        className={cn(
          "fixed top-3.5 left-1/2 -translate-x-1/2 z-50 w-full max-w-[460px] px-4 transition-all duration-300",
          isScrolled
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-5 pointer-events-none"
        )}
        aria-hidden={!isScrolled}
      >
        <div className="rounded-full bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0_41_112/0.16)] border border-line p-0.5">
          <ProductSearch items={products} />
        </div>
      </div>

      {/* ========================================================
          MAIN NAVBAR
          Visible at top of page. Search bar grouped together with nav links.
          ======================================================== */}
      <header className="relative z-40 bg-transparent transition-all duration-300">
        <div className="mx-auto flex h-(--header-height) w-full max-w-(--container-page) items-center justify-between gap-6 px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* Left Side: Logo */}
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Right Side: Search bar together with Nav links & Profile/Login */}
          <div className="ml-auto hidden items-center gap-5 xl:gap-7 lg:flex">
            {/* Searchbar adjacent to navlinks */}
            <div className="w-[230px] xl:w-[270px] shrink-0">
              <ProductSearch items={products} />
            </div>

            {/* Nav links & Account/Login: Always visible on desktop */}
            <nav aria-label="Main" className="flex items-center gap-5 xl:gap-7">
              <ul className="flex items-center gap-5 xl:gap-7">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={pathname === l.href ? "page" : undefined}
                      className={cn(
                        "text-body transition hover:text-navy text-[14px]",
                        pathname === l.href ? "font-bold text-navy" : "text-muted"
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                {cartCount > 0 && (
                  <li>
                    <Link
                      href="/cart"
                      className="text-body font-bold text-navy transition hover:underline text-[14px]"
                    >
                      Cart · {cartCount}
                    </Link>
                  </li>
                )}
              </ul>

              {/* Profile or Login Button */}
              {userName ? (
                <Link
                  href={dashboardHref}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1.5 pr-3.5 shadow-xs transition hover:border-navy/40 hover:shadow-sm"
                  title={dashboardTitle}
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-navy font-bold text-xs text-white uppercase shadow-xs">
                    {userName.trim().charAt(0)}
                  </div>
                  <span className="font-semibold text-charcoal text-xs">
                    {userName.split(" ")[0]}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openModal("login")}
                  className={buttonClasses({
                    size: "xs",
                    className: "h-[42px] min-w-22 shadow-xs hover:shadow-sm cursor-pointer",
                  })}
                >
                  Login
                </button>
              )}
            </nav>
          </div>

          {/* Mobile menu button */}
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
          {userName ? (
            <Link
              href={dashboardHref}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-navy py-2.5 font-bold text-white shadow-xs"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-white/20 font-bold text-xs uppercase">
                {userName.trim().charAt(0)}
              </div>
              <span>{dashboardLabel} ({userName.split(" ")[0]})</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpenedOn(null);
                openModal("login");
              }}
              className={buttonClasses({ size: "sm", className: "mt-3 w-full cursor-pointer" })}
            >
              Login
            </button>
          )}
        </nav>
      )}
    </header>
    </>
  );
}
