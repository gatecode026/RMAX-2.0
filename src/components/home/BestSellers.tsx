import { ShowcaseCard } from "@/components/catalog/cards";
import { ButtonLink } from "@/components/ui/Button";
import type { ProductDTO } from "@/lib/data/content";

export function BestSellers({ products }: { products: ProductDTO[] }) {
  return (
    <section id="best-sellers" className="mx-auto mt-16 w-full max-w-(--container-page) scroll-mt-24 px-5 sm:px-8 md:mt-[80px] lg:px-8 xl:px-16 xl:mt-[104px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-label font-extrabold tracking-wider text-navy uppercase">Best sellers</p>
          <h2 className="mt-2 font-heading text-[30px]/[38px] sm:text-[36px]/[44px] lg:text-[40px]/[48px] xl:text-[48px]/[56px] font-extrabold tracking-[-1px] text-charcoal">
            Sanitary disposal for shared spaces.
          </h2>
        </div>
        <ButtonLink href="/compare-models?select=1" variant="outline" className="h-[46px] sm:h-[51px] px-6 sm:px-8">
          Compare
        </ButtonLink>
      </div>
      <div className="mt-6 md:mt-[34px] grid gap-3.5 sm:gap-4 md:grid-cols-3 xl:gap-7">
        {/* Three products with photos first; the rest live on the full catalogue page. */}
        {[...products].sort((a, b) => Number(Boolean(b.image?.src)) - Number(Boolean(a.image?.src))).slice(0, 3).map((p) => (
          <ShowcaseCard key={p.slug} product={p} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <ButtonLink href="/our-product" className="h-[48px] px-8">
          View all products
        </ButtonLink>
      </div>
    </section>
  );
}
