import { ShowcaseCard } from "@/components/catalog/cards";
import { ButtonLink } from "@/components/ui/Button";
import type { ProductDTO } from "@/lib/data/content";

export function BestSellers({ products }: { products: ProductDTO[] }) {
  return (
    <section id="best-sellers" className="mx-auto mt-16 w-full max-w-(--container-home) scroll-mt-24 px-5 sm:px-8 md:mt-[104px] xl:px-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[14px] font-extrabold tracking-[0.28em] text-navy uppercase">Best sellers</p>
          <h2 className="mt-2 font-jakarta text-[30px]/[38px] font-bold tracking-[-0.01em] text-charcoal md:text-[48px]/[56px]">
            Sanitary disposal for shared spaces.
          </h2>
        </div>
        <ButtonLink href="/compare-models" variant="outline" className="h-[51px] px-8">
          Compare
        </ButtonLink>
      </div>
      <div className="mt-[34px] grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ShowcaseCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
