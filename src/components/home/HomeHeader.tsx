import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/auth";
import { Logo } from "@/components/layout/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { getCart } from "@/lib/cart";
import { getProducts } from "@/lib/data/content";
import { HomeHeaderView } from "./HomeHeaderView";

async function HomeHeaderDynamic() {
  await connection();
  const [products, session, cart] = await Promise.all([getProducts(), auth(), getCart()]);
  return (
    <HomeHeaderView
      userName={session?.user?.name ?? null}
      userRole={session?.user?.role ?? null}
      cartCount={cart.count}
      products={products.map((p) => ({ slug: p.slug, name: p.name, summary: p.summary }))}
    />
  );
}

/** Prerenderable shell (no request-time hooks) shown while the session resolves. */
function HomeHeaderStatic() {
  return (
    <header className="sticky top-0 z-50 bg-transparent transition-all duration-300">
      <div className="mx-auto flex h-(--header-height) w-full max-w-(--container-page) items-center justify-between gap-6 px-5 sm:px-8 lg:px-8 xl:px-16">
        <Logo />
        <Link href="/login" className={buttonClasses({ size: "xs", className: "h-[43px] min-w-20" })}>
          Login
        </Link>
      </div>
    </header>
  );
}

export function HomeHeader() {
  return (
    <Suspense fallback={<HomeHeaderStatic />}>
      <HomeHeaderDynamic />
    </Suspense>
  );
}
