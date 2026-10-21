import { Footer } from "@/components/layout/Footer";
import { HomeHeader } from "@/components/home/HomeHeader";

/** Catalogue pages (Our Product, product detail) share the Home header/footer on the warm canvas. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-action bg-navy px-5 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="flex-1 bg-canvas">
        <HomeHeader />
        <main id="main" className="pb-16 md:pb-[72px]">
          {children}
        </main>
      </div>
      <Footer variant="home" />
    </>
  );
}
