import type { Metadata } from "next";
import Image from "next/image";
import { ProductListing } from "@/components/catalog/ProductListing";
import { getAllProducts } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Our Product",
  description:
    "Explore sanitary napkin incinerators, pad vending machines and more from RMAX Solutions, an Indian manufacturer and OEM supplier.",
};

export default async function OurProductPage() {
  const products = await getAllProducts();
  return (
    <>
      <section className="mx-auto grid w-full max-w-(--container-page) items-center gap-8 px-5 pt-4 sm:px-8 md:pt-8 lg:grid-cols-[1fr_630px] lg:gap-12 lg:px-12 xl:px-16 xl:pt-[64px]">
        <div>
          <h1 className="font-jakarta text-[36px]/[44px] font-bold tracking-[-0.01em] text-charcoal md:text-[52px]/[64px]">
            Sanitary disposal to GPS trackers for your bussiness needs.
          </h1>
          <p className="mt-5 max-w-[600px] text-body text-muted">
            Explore Sanitary napkin incinerators, Pad Vending Machines and many more from RMAX Solutions, an Indian manufacturer and OEM
            supplier.
          </p>
        </div>
        <Image
          src="/images/products/hero-lineup.png"
          alt="RMAX range: a red pad vending machine, a blue incinerator and a floral pad dispenser on stone plinths"
          width={630}
          height={281}
          priority
          className="h-auto w-full rounded-[36px] object-cover md:h-[281px]"
        />
      </section>

      <div className="mt-10 md:mt-14">
        <ProductListing products={products} />
      </div>
    </>
  );
}
