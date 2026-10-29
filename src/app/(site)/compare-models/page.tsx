import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { CompareView } from "@/components/compare/CompareView";
import { getAllProducts } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Compare Models",
  description: "Capacity, power and launch pricing at a glance. Match the model to the expected daily usage of your institution.",
};

export default async function CompareModelsPage(props: {
  searchParams?: Promise<{ models?: string; select?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const allProducts = await getAllProducts();

  const initialSelectedSlugs = searchParams.models
    ? searchParams.models.split(",").map((s) => s.trim()).filter(Boolean)
    : ["basic", "pro", "pro-max"];

  const initialOpenSelector = searchParams.select === "1" || searchParams.select === "true";

  return (
    <>
      <PageHero
        breadcrumb="Compare Models"
        eyebrow="Compare Models"
        title="Choose with confidence."
        lead="Capacity, power and launch pricing at a glance. Match the model to the expected daily usage of your institution."
      />

      <Container className="mt-10 md:mt-14">
        {/* Interactive Comparison View with max-3 product selector */}
        <CompareView
          allProducts={allProducts}
          initialSelectedSlugs={initialSelectedSlugs}
          initialOpenSelector={initialOpenSelector}
        />

        {/* Bottom Institutional Guidance Banner */}
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
