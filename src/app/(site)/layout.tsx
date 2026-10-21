import { Footer } from "@/components/layout/Footer";
import { HomeHeader } from "@/components/home/HomeHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-action bg-navy px-5 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <HomeHeader />
      <main id="main" className="flex-1 pb-16 md:pb-24">
        {children}
      </main>
      <Footer />
    </>
  );
}
