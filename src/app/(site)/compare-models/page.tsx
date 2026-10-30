import type { Metadata } from "next";
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

  return (
    <div className="w-full -mb-16 md:-mb-24 pb-16 md:pb-24 pt-6 sm:pt-8 bg-[linear-gradient(90deg,#E1F5FF_0%,#FFFFFF_48%,#EAF1FF_100%)]">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 xl:px-0">
        <CompareView
          allProducts={allProducts}
          initialSelectedSlugs={initialSelectedSlugs}
        />
      </div>
    </div>
  );
}
