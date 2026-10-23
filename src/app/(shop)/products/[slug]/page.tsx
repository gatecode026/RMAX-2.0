import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { PurchasePanel } from "@/components/catalog/PurchasePanel";
import { ProductTabs, type TabItem } from "@/components/catalog/ProductTabs";
import { RelatedCard } from "@/components/catalog/cards";
import {
  ApplicationsCard,
  FeaturesCard,
  OverviewSection,
  ProductTestimonial,
  RatingRow,
  SpecTiles,
  TechSpecsCard,
  TrustRow,
} from "@/components/catalog/DetailSections";
import { ButtonLink } from "@/components/ui/Button";
import { getAllProducts, getProductBySlug, getProductTestimonial, getReviewSummary, getTrustPoints } from "@/lib/data/content";
import { SITE_URL } from "@/lib/constants";

type Params = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  return (await getAllProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found" };
  const description = p.intro ?? p.summary ?? `${p.title} from RMAX Solutions.`;
  return {
    title: p.title,
    description,
    openGraph: { title: p.title, description, images: [{ url: p.image.src, width: p.image.width, height: p.image.height, alt: p.image.alt }] },
  };
}

/** Quote-form model keys; other catalogue items are enquired about through Contact Us. */
const QUOTE_MODELS = new Set(["basic", "pro", "pro-max"]);

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [all, trust, reviews, testimonial] = await Promise.all([
    getAllProducts(),
    getTrustPoints(),
    getReviewSummary(),
    getProductTestimonial(slug),
  ]);
  const related = all.filter((p) => p.slug !== slug).slice(0, 3);
  const isIncinerator = product.category === "incinerator";
  const s = product.specs;
  const batchKnown = s.batchCapacity !== "Not specified";

  const tiles = isIncinerator
    ? [
        { value: s.power.replace(" W", "W"), label: "Power" },
        { value: s.weight, label: "Weight" },
        { value: s.dailyCapacity, label: "Capacity" },
        { value: batchKnown ? s.batchCapacity : s.colours, label: batchKnown ? "Burning at once" : "Colours" },
      ]
    : (product.chips ?? []).map((c) => ({ value: c, label: "Type" }));

  const gallery = product.gallery?.length
    ? product.gallery
    : [{ src: product.image.src, thumb: product.image.src, alt: product.image.alt, kind: "image" as const }];

  const tabs: TabItem[] = [
    { label: "Overview", id: "overview" },
    { label: "Specifications", id: "specifications" },
    ...(product.features?.length ? [{ label: "Features", id: "features" }] : []),
    ...(product.applications?.length ? [{ label: "Applications", id: "applications" }] : []),
    { label: "FAQs", href: "/help" },
    { label: "Support", href: "/contact-us" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.intro ?? product.summary,
    image: `${SITE_URL}${product.image.src}`,
    brand: { "@type": "Brand", name: "RMAX Solutions" },
    offers: { "@type": "Offer", priceCurrency: "INR", price: product.price, availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Gallery + summary + price */}
      <section className="mx-auto w-full max-w-(--container-page) px-5 pt-2 sm:px-8 md:pt-4 xl:px-0">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[auto_minmax(0,1fr)]">
          <ProductGallery items={gallery} title={product.title} />

          <div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-8 xl:grid-cols-[minmax(0,1fr)_301px]">
              <div>
                <RatingRow rating={reviews.rating} stars={reviews.stars} label={reviews.label} />
                <h1 className="mt-3 font-jakarta text-[28px]/9 font-bold tracking-[-0.01em] text-charcoal md:text-[36px]/[44px]">{product.title}.</h1>
                {product.intro && <p className="mt-4 text-body leading-6 text-muted">{product.intro}</p>}
                {tiles.length > 0 && <SpecTiles tiles={tiles} />}
              </div>
              <PurchasePanel
                slug={product.slug}
                price={product.price}
                mrp={product.mrp}
                colours={product.colours}
                quoteModel={QUOTE_MODELS.has(product.slug) ? product.slug : null}
                showOptions={isIncinerator}
              />
            </div>
            <TrustRow points={trust} />
          </div>
        </div>
      </section>

      <div className="mt-10 md:mt-[62px]">
        <ProductTabs items={tabs} />
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-(--container-page) flex-col gap-6 px-5 sm:px-8 xl:px-0">
        <OverviewSection text={product.overview ?? product.summary ?? product.intro ?? ""} image={product.overviewImage} />

        <div className="grid items-stretch gap-6 lg:grid-cols-[1.24fr_1fr]">
          {product.features?.length || product.applications?.length ? (
            <div className="flex flex-col gap-6 [&>section:first-child]:flex-[1.5]">
              {product.features?.length ? <FeaturesCard items={product.features} /> : null}
              {product.applications?.length ? <ApplicationsCard items={product.applications} /> : null}
            </div>
          ) : (
            <div />
          )}
          {product.techSpecs?.length ? <TechSpecsCard rows={product.techSpecs} /> : null}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-h" className="mx-auto mt-14 w-full max-w-(--container-page) px-5 sm:px-8 md:mt-16 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="related-h" className="font-jakarta text-[28px]/9 font-bold tracking-[-0.01em] text-charcoal md:text-[36px]/[44px]">
              Related products.
            </h2>
            <ButtonLink href="/our-product" variant="outline" className="h-[46px] px-6 text-body-sm">
              View all products →
            </ButtonLink>
          </div>
          <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug} className="h-full">
                <RelatedCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {testimonial && (
        <div className="mx-auto mt-8 w-full max-w-(--container-page) px-5 sm:px-8 xl:px-0">
          <ProductTestimonial t={testimonial} />
        </div>
      )}
    </>
  );
}
