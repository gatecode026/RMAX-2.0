import { Footer } from "@/components/layout/Footer";
import { HomeHeader } from "@/components/home/HomeHeader";

/** The Home design has its own header (product search, no Cart/Help) and footer copy. */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-action bg-navy px-5 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="flex-1 bg-[linear-gradient(90deg,#EAF0F8_0%,#FDFEFF_42%,#FDFDFD_100%)]">
        <HomeHeader />
        <main id="main" className="pb-16 md:pb-[95px]">
          {children}
        </main>
      </div>
      <Footer variant="home" />
    </>
  );
}
