import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { BuyButton } from "@/components/sections/BuyButton";
import { ButtonLink } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { getProducts } from "@/lib/data/content";
import { formatINR } from "@/lib/format";
import { SPEC_ROWS } from "@/lib/specs";

export const metadata: Metadata = {
  title: "Compare Models",
  description: "Capacity, power and launch pricing at a glance. Match the model to the expected daily usage of your institution.",
};

/** Label column + three model columns, proportional (244 : 304 × 3) so the table fills the 1280px container. */
const COLS = "grid grid-cols-[244fr_304fr_304fr_304fr]";

export default async function CompareModelsPage() {
  const products = await getProducts();

  return (
    <>
      <PageHero
        breadcrumb="Compare Models"
        eyebrow="Compare Models"
        title="Choose with confidence."
        lead="Capacity, power and launch pricing at a glance. Match the model to the expected daily usage of your institution."
      />

      <Container className="mt-12 md:mt-16">
        <div className="overflow-hidden rounded-card-lg border border-line bg-card shadow-card">
          <div className="relative overflow-x-auto">
            <div className="min-w-[1156px]">
              {/* Product header */}
              <div className={`${COLS} items-stretch pt-6 pb-6`}>
                <div className="flex flex-col justify-end gap-3 pl-6 pr-4">
                  <Pill>50% launch offers</Pill>
                  <h2 className="text-title">Find your fit.</h2>
                  <p className="text-body text-muted">All three models share enclosed operation and low maintenance.</p>
                </div>
                {products.map((p) => (
                  <div key={p.slug} className="pl-6">
                    <Image
                      src={p.image.src}
                      alt={p.image.alt}
                      width={280}
                      height={190}
                      className="h-[190px] w-full rounded-[24px] object-cover"
                    />
                    <h2 className="mt-5 text-title">{p.name}</h2>
                    <p className="mt-2 font-heading text-[32px]/10 font-extrabold text-charcoal">{formatINR(p.price)}</p>
                    <p className="mt-1 text-body-sm text-muted">
                      <span className="sr-only">Original price </span>
                      {formatINR(p.originalPrice)}
                    </p>
                    <BuyButton slug={p.slug} className="mt-5" />
                    <ButtonLink href={`/institutional-quote?model=${p.slug}`} variant="secondary" className="mt-3 w-full">
                      Request quote
                    </ButtonLink>
                  </div>
                ))}
              </div>

              {/* Specification table */}
              <table className="w-full table-fixed border-collapse text-left">
                <caption className="sr-only">Specification comparison of Basic, Pro and Pro-Max</caption>
                <colgroup>
                  <col style={{ width: "21.1%" }} />
                  <col style={{ width: "26.3%" }} />
                  <col style={{ width: "26.3%" }} />
                  <col style={{ width: "26.3%" }} />
                </colgroup>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Specification</th>
                    {products.map((p) => (
                      <th key={p.slug} scope="col">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPEC_ROWS.map((row) => (
                    <tr key={row.key} className="h-[57px] odd:bg-soft/60">
                      <th scope="row" className="pl-6 text-body font-bold text-charcoal">
                        {row.label}
                      </th>
                      {products.map((p) => (
                        <td key={p.slug} className="pl-6 text-body text-muted">
                          {p.specs[row.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col items-start justify-between gap-6 rounded-[24px] sm:rounded-card-lg bg-charcoal p-5 sm:p-8 text-white md:flex-row md:items-center md:px-9">
          <div className="max-w-[820px]">
            <h2 className="text-title text-white">Not sure which capacity you need?</h2>
            <p className="mt-3 text-body text-muted-dark">
              Share your institution type, daily usage and number of washrooms. Our team can help with model selection and installation
              planning.
            </p>
          </div>
          <ButtonLink href="/institutional-quote" variant="dark" className="w-full sm:w-auto shrink-0 text-center">
            Request institutional quote
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
