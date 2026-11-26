import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Menu } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { Logo } from "@/components/layout/Logo";
import { getCart } from "@/lib/cart";
import { getAllProducts, getFamilies } from "@/lib/data/content";
import { HomeHeaderView } from "./HomeHeaderView";
import { HomeHeaderFallback } from "./HomeHeaderFallback";

async function HomeHeaderDynamic() {
  await connection();
  // Customer session only — an Admin or Manager who is only logged into their own portal is
  // shown the ordinary guest header here, never their staff identity.
  const [products, families, sessionUser, cart] = await Promise.all([getAllProducts(), getFamilies(), getSessionUser("customer"), getCart()]);
  return (
    <HomeHeaderView
      userName={sessionUser?.name ?? null}
      userRole={sessionUser?.role ?? null}
      cart={cart}
      cartCount={cart.count}
      products={products.map((p) => {
        const f = families.find((x) => x._id === p.familyId);
        return { slug: p.slug, name: p.name, summary: p.summary, familyId: f?._id, familyName: f?.name, isDefault: f?.defaultProduct === p._id };
      })}
    />
  );
}

/**
 * Prerenderable shell shown while the session resolves. It has the same layout as the real header (logo, search
 * slot, links, account slot) so the full header does not "pop in" after a Login-only bar. The account slot is an
 * empty placeholder: the shell cannot know yet whether the visitor is logged in, so it shows neither Login nor
 * a profile.
 */
const SHELL_LINKS = [
  { label: "Our Product", href: "/our-product" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "About Us", href: "/about-us" },
] as const;

function HomeHeaderStatic() {
  return (
    <header className="sticky top-0 z-40 w-full bg-transparent">
      <div className="relative mx-auto flex h-(--header-height) w-full max-w-(--container-page) items-center justify-between px-5 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:px-8 xl:px-16">
        <div className="z-10 flex shrink-0 items-center justify-start">
          <Logo />
        </div>
        <div className="z-10 hidden w-[290px] items-center justify-center min-[1120px]:w-[330px] lg:flex xl:w-[410px] 2xl:w-[450px]">
          <div className="h-11 w-full rounded-full border border-line bg-card" aria-hidden />
        </div>
        <div className="z-10 hidden shrink-0 items-center justify-end lg:flex">
          <nav aria-label="Main" className="flex items-center justify-end gap-2 min-[1120px]:gap-3.5 xl:gap-5 2xl:gap-6">
            <ul className="flex items-center gap-2 min-[1120px]:gap-3.5 xl:gap-5 2xl:gap-6">
              {SHELL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="whitespace-nowrap text-[13px] font-medium text-muted transition hover:text-navy min-[1120px]:text-[13.5px] xl:text-[14px]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <span className="ml-1 inline-block h-[38px] min-w-19 min-[1120px]:h-[40px] min-[1120px]:min-w-22" aria-hidden />
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-2.5 lg:hidden">
          <span className="inline-flex size-10.5 items-center justify-center rounded-full border border-line bg-card text-navy" aria-hidden>
            <Menu className="size-5" />
          </span>
        </div>
      </div>
    </header>
  );
}

export function HomeHeader() {
  return (
    <Suspense fallback={<HomeHeaderFallback shell={<HomeHeaderStatic />} />}>
      <HomeHeaderDynamic />
    </Suspense>
  );
}
