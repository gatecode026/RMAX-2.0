import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { HomeHeader } from "@/components/home/HomeHeader";
import { NotFoundContent } from "@/components/sections/NotFoundContent";

export const metadata: Metadata = { title: "Page not found" };

/** Handles URLs that match no route at all (outside the (site) layout). */
export default function RootNotFound() {
  return (
    <>
      <HomeHeader />
      <main id="main" className="flex-1 pb-16 md:pb-24">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
