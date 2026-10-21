import { Footer } from "@/components/layout/Footer";
import { HomeHeader } from "@/components/home/HomeHeader";

/** About Us design: the shared header on a plain white bar, and the wide footer. */
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-action bg-navy px-5 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="relative z-40 bg-card">
        <HomeHeader />
      </div>
      <main id="main" className="flex-1 bg-card">
        {children}
      </main>
      <Footer variant="wide" />
    </>
  );
}
