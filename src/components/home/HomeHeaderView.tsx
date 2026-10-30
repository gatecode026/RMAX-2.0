"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ProductSearch } from "./ProductSearch";
import { HeaderCart } from "./HeaderCart";
import { useAuthModal } from "@/context/AuthModalContext";
import type { CartView } from "@/lib/cart";

type Props = {
  userName: string | null;
  userRole?: string | null;
  /** Initial cart data for dropdown popover and count badge */
  cart?: CartView;
  cartCount?: number;
  products: { slug: string; name: string; summary?: string }[];
};

const LINKS = [
  { label: "Our Product", href: "/our-product" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "About Us", href: "/about-us" },
] as const;

/** Home-page header: logo · product search · Our Product / Contact Us / About Us · Login. */
export function HomeHeaderView({ userName, userRole, products, cart, cartCount = 0 }: Props) {
  const pathname = usePathname();
  const { openModal } = useAuthModal();
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // GoKiwi-style smart scroll animation & direction detection
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // 1. Scrolled threshold
      setIsScrolled(currentScrollY > 20);

      // 2. Hide on scroll down, reveal on scroll up
      if (currentScrollY <= 20) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 4) {
        // Scrolling DOWN
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current && lastScrollY.current - currentScrollY > 4) {
        // Scrolling UP
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;

      // 3. Auto-reveal when scrolling pauses for ~350ms (GoKiwi signature)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 350);
    };

    window.addEventListener("scroll", controlNavbar, { passive: true });
    return () => {
      window.removeEventListener("scroll", controlNavbar);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
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
  const shouldShow = isVisible || open;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300 ease-out will-change-transform",
        isScrolled
          ? "bg-canvas/90 backdrop-blur-md border-b border-line/60 shadow-[0_2px_12px_rgba(0,41,112,0.04)]"
          : "bg-transparent border-b border-transparent",
        shouldShow ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="relative mx-auto flex h-(--header-height) w-full max-w-(--container-page) items-center justify-between px-5 sm:px-8 lg:px-8 xl:px-16 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
        {/* Left Side: Logo (pinned to start in Column 1) */}
        <div className="flex items-center justify-start shrink-0 z-10">
          <Logo />
        </div>

        {/* Center: Search bar (Dead center in Column 2, full original width) */}
        <div className="hidden lg:flex items-center justify-center w-[290px] min-[1120px]:w-[330px] xl:w-[410px] 2xl:w-[450px] z-10">
          <ProductSearch items={products} className="w-full" />
        </div>

        {/* Right Side: Nav links, Cart (if logged in) & Profile/Login (Column 3, auto-adjusting gap) */}
        <div className="hidden lg:flex items-center justify-end shrink-0 z-10">
          <nav aria-label="Main" className="flex items-center justify-end gap-2 min-[1120px]:gap-3.5 xl:gap-5 2xl:gap-6">
            <ul className="flex items-center gap-2 min-[1120px]:gap-3.5 xl:gap-5 2xl:gap-6">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={pathname === l.href ? "page" : undefined}
                    className={cn(
                      "transition hover:text-navy text-[13px] min-[1120px]:text-[13.5px] xl:text-[14px] whitespace-nowrap",
                      pathname === l.href ? "font-bold text-navy" : "text-muted font-medium"
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Cart Icon with Live Count: ONLY rendered when logged in */}
            {userName ? (
              <div className="pl-1">
                <HeaderCart initialCart={cart} />
              </div>
            ) : null}

            {/* Profile or Login Button */}
            {userName ? (
              <Link
                href={dashboardHref}
                className="flex size-9 min-[1120px]:size-10 shrink-0 items-center justify-center rounded-full bg-navy font-bold text-[13.5px] text-white uppercase shadow-xs transition hover:opacity-90 hover:scale-105 ml-1"
                title={dashboardTitle}
                aria-label={dashboardTitle}
              >
                {userName.trim().charAt(0)}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openModal("login")}
                className={buttonClasses({
                  size: "xs",
                  className: "h-[38px] min-[1120px]:h-[40px] min-w-19 min-[1120px]:min-w-22 shadow-xs hover:shadow-sm cursor-pointer whitespace-nowrap ml-1 text-[13px] min-[1120px]:text-[13.5px]",
                })}
              >
                Login
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Cart & Hamburger Menu button (Visible only < lg) */}
        <div className="flex items-center gap-2.5 lg:hidden ml-auto">
          {userName ? <HeaderCart initialCart={cart} /> : null}
          <button
            type="button"
            className="inline-flex size-10.5 items-center justify-center rounded-full border border-line bg-card text-navy cursor-pointer"
            aria-expanded={open}
            aria-controls="home-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpenedOn(open ? null : pathname)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
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
              { label: "Help", href: "/help" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-input px-2 py-3 text-body font-semibold text-charcoal">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Cart Direct Row (only for logged-in users) */}
          {userName && (
            <div className="mt-2 border-t border-line/60 pt-2">
              <Link
                href="/cart"
                onClick={() => setOpenedOn(null)}
                className="flex items-center justify-between rounded-input px-3 py-2.5 text-body font-semibold text-charcoal hover:bg-soft transition"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="size-4.5 text-navy" aria-hidden="true" />
                  <span>Shopping Cart</span>
                </div>
                {cartCount > 0 ? (
                  <span className="rounded-full bg-navy px-2 py-0.5 text-xs font-bold text-white">
                    {cartCount} {cartCount === 1 ? "unit" : "units"}
                  </span>
                ) : (
                  <span className="text-xs text-muted">0 items</span>
                )}
              </Link>
            </div>
          )}

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
  );
}
