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
      <section className="mx-auto grid w-full max-w-(--container-page) items-center gap-6 px-5 sm:px-8 lg:px-8 xl:px-16 pt-2 sm:pt-3 md:pt-4 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_540px] lg:gap-8">
        <div>
          <h1 className="font-heading text-[30px]/[38px] font-extrabold tracking-[-1.2px] text-charcoal sm:text-[36px]/[44px] lg:text-[40px]/[48px] xl:text-[52px]/[64px]">
            Sanitary disposal to GPS trackers for your bussiness needs.
          </h1>
          <p className="mt-3.5 sm:mt-4 max-w-[600px] text-body-sm sm:text-body text-muted leading-relaxed">
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
          style={{ width: "100%", height: "auto" }}
          className="rounded-[28px] sm:rounded-[36px] object-cover"
        />
      </section>

      <div className="mt-6 md:mt-8">
        <ProductListing products={products} />
      </div>
    </>
  );
}
