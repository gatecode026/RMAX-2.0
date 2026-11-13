import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { PurchasePanel } from "@/components/catalog/PurchasePanel";
import { ProductTabs, type TabItem } from "@/components/catalog/ProductTabs";
import { RelatedCard } from "@/components/catalog/cards";
import { ProductFaqCard } from "@/components/catalog/ProductFaqCard";
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
import { FeaturedTestimonial } from "@/components/home/Testimonials";
import {
  getAllProducts,
  getProductBySlug,
  getProductBySlugAnyStatus,
  getProductTestimonial,
  getReviewSummary,
  getTrustPoints,
} from "@/lib/data/content";
import { getSessionUser } from "@/lib/session";
import { SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/cn";

type Params = { params: Promise<{ slug: string }> };

export const instant = false;

export async function generateStaticParams() {
  const all = await getAllProducts();
  const slugs = new Set([...all.map((p) => p.slug), "pad-vending"]);
  return Array.from(slugs).map((slug) => ({ slug }));
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

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  let product = await getProductBySlug(slug);
  let isDraftPreview = false;

  // Not published (or doesn't exist) for the public — but an authenticated Admin/Manager may
  // still be previewing a draft/archived product via its real slug (PRD §4N/§5). Ordinary
  // visitors never reach this branch's result: without a staff session it still 404s.
  if (!product) {
    const staff = await getSessionUser("staff");
    if (staff) {
      const draft = await getProductBySlugAnyStatus(slug);
      if (draft) {
        product = draft;
        isDraftPreview = draft.status !== "published";
      }
    }
  }
  if (!product) notFound();

  const [all, trust, reviews, testimonial] = await Promise.all([
    getAllProducts(),
    getTrustPoints(),
    getReviewSummary(),
    getProductTestimonial(slug),
  ]);
  const others = all.filter((p) => p.slug !== slug);
  const related = [...others.filter((p) => p.category === product.category), ...others.filter((p) => p.category !== product.category)].slice(0, 3);
  const isIncinerator = product.category === "incinerator";
  const isDustRemover = product.slug === "dust-remover-machine";
  const isShredder = product.slug === "plastic-waste-shredder-machine";
  const isBailing = product.slug === "plastic-bailing-machine";
  // Hygiene models keep the settings-based trust points; every other catalogue item gets neutral, documented ones.
  const useNeutralTrust = product.category !== "incinerator" && product.category !== "pad-vending";
  const s = product.specs;
  const batchKnown = s.batchCapacity !== "Not specified";

  const tiles = isBailing
    ? [
        { value: "Hydraulic", label: "Vertical Clamping" },
        { value: "7.5 HP", label: "Motor Power" },
        { value: "50–60 kg", label: "Bale Weight" },
        { value: "1 Year", label: "Manufacturer Warranty" },
      ]
    : isShredder
    ? [
        { value: "1 Tonne/day", label: "Processing Capacity" },
        { value: "10 HP", label: "Motor Power" },
        { value: "4 + 2", label: "Rotary and Stationary Blades" },
        { value: "300 kg", label: "Weighing Pan Capacity" },
      ]
    : isDustRemover
    ? [
        { value: "120–200 kg/hr", label: "Machine Output" },
        { value: "915 mm", label: "Drum Diameter" },
        { value: "10–15 HP", label: "Main Motor" },
        { value: "2100 mm", label: "Drum Length" },
      ]
    : isIncinerator && s.power !== "Not specified"
    ? [
        { value: s.power.replace(" W", "W"), label: "Power" },
        { value: s.weight, label: "Weight" },
        { value: s.dailyCapacity, label: "Capacity" },
        { value: batchKnown ? s.batchCapacity : s.colours, label: batchKnown ? "Burning at once" : "Colours" },
      ]
    : product.category === "pad-vending"
    ? [
        { value: "Automatic / Manual", label: "Operation" },
        { value: "Push Button", label: "Free Dispense" },
        { value: "Wall Mount", label: "Installation" },
        { value: "1 Year", label: "Warranty" },
      ]
    : [];

  const displayTrust = isBailing
    ? [
        { icon: "shield" as const, title: "1-Year Warranty", body: "Manufacturer warranty as stated in the catalogue" },
        { icon: "truck" as const, title: "100% Made in India", body: "PAN India delivery & in-house industrial manufacturing" },
        { icon: "cog" as const, title: "Post-warranty support", body: "Spare parts & servicing available from manufacturer" },
      ]
    : useNeutralTrust
    ? [
        { icon: "shield" as const, title: "In-house manufacturing", body: "Designed and built at the RMAX facility in Jaipur" },
        { icon: "truck" as const, title: "Installation support", body: "On-site installation, demonstration and user training" },
        { icon: "cog" as const, title: "After-sales service", body: "Spares, maintenance and responsive support" },
      ]
    : trust;

  const hasImage = Boolean(product.image?.src);
  const gallery = product.gallery?.length
    ? product.gallery
    : hasImage
    ? [{ src: product.image.src, thumb: product.image.src, alt: product.image.alt, kind: "image" as const }]
    : [];

  const tabs: TabItem[] = [
    { label: "Overview", id: "overview" },
    { label: "Specifications", id: "specifications" },
    ...(product.features?.length ? [{ label: "Features", id: "features" }] : []),
    ...(product.applications?.length ? [{ label: "Applications", id: "applications" }] : []),
    ...(product.faqs?.length ? [{ label: "FAQs", id: "faqs" }] : [{ label: "FAQs", href: "/help" }]),
    { label: "Support", href: "/contact-us" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.intro ?? product.summary,
    ...(hasImage ? { image: product.image.src.startsWith("http") ? product.image.src : `${SITE_URL}${product.image.src}` } : {}),
    brand: { "@type": "Brand", name: "RMAX Solutions" },
    ...(product.price > 0 ? { offers: { "@type": "Offer", priceCurrency: "INR", price: product.price, availability: "https://schema.org/InStock" } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {isDraftPreview && (
        <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-center text-[13px] font-bold text-charcoal">
          Admin preview — this product is {product.status} and is not visible to customers.
        </div>
      )}

      {/* Gallery + summary + price */}
      <section className="mx-auto w-full max-w-(--container-page) px-5 pt-1 sm:px-6 md:pt-2.5 lg:px-8 xl:px-10 2xl:px-16">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:gap-7 xl:gap-8 lg:grid-cols-[auto_minmax(0,1fr)]">
          {gallery.length ? (
            <ProductGallery items={gallery} title={product.title} />
          ) : (
            <div className="grid aspect-[461/530] w-full max-h-[430px] place-items-center rounded-[24px] bg-soft px-6 text-center font-heading text-[18px] font-extrabold text-navy/60 sm:w-[350px] md:w-[365px] xl:w-[380px] sm:max-w-full">
              Product photo coming soon
            </div>
          )}

          <div className="flex flex-col justify-between gap-5">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px] 2xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
              <div>
                <RatingRow rating={reviews.rating} stars={reviews.stars} label={reviews.label} />
                <h1 className="mt-2 font-heading text-[24px]/[32px] sm:text-[28px]/[36px] xl:text-[30px]/[38px] 2xl:text-[34px]/[42px] font-extrabold tracking-[-0.8px] text-charcoal">
                  {product.title}.
                </h1>
                {product.intro && <p className="mt-2.5 text-body-sm sm:text-body leading-relaxed text-muted">{product.intro}</p>}
                {tiles.length > 0 && <SpecTiles tiles={tiles} />}
              </div>

              {/* Price card — sits beside the title/description/spec-tiles column on wide screens */}
              <PurchasePanel
                slug={product.slug}
                price={product.price}
                mrp={product.mrp}
                colours={product.colours}
                quoteModel={product.slug}
                showOptions={product.price > 0}
              />
            </div>

            <TrustRow points={displayTrust} />
          </div>
        </div>
      </section>

      <div className="mt-10 md:mt-[62px]">
        <ProductTabs items={tabs} />
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-(--container-page) flex-col gap-6 px-5 sm:px-8 lg:px-8 xl:px-16">
        <OverviewSection text={product.overview ?? product.summary ?? product.intro ?? ""} image={product.overviewImage} />

        {Boolean(product.features?.length || product.applications?.length) && product.techSpecs?.length ? (
          <div className="grid items-stretch gap-6 lg:grid-cols-[1.24fr_1fr]">
            <div className="flex flex-col gap-6 [&>section:first-child]:flex-[1.5]">
              {product.features?.length ? <FeaturesCard items={product.features} /> : null}
              {product.applications?.length ? <ApplicationsCard items={product.applications} /> : null}
            </div>
            <TechSpecsCard rows={product.techSpecs} />
          </div>
        ) : product.techSpecs?.length ? (
          <div className="w-full">
            <TechSpecsCard rows={product.techSpecs} />
          </div>
        ) : product.features?.length || product.applications?.length ? (
          <div className="flex flex-col gap-6">
            {product.features?.length ? <FeaturesCard items={product.features} /> : null}
            {product.applications?.length ? <ApplicationsCard items={product.applications} /> : null}
          </div>
        ) : null}

        {Boolean(product.faqs?.length) && <ProductFaqCard faqs={product.faqs!} />}
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-h" className="mx-auto mt-14 w-full max-w-(--container-page) px-5 sm:px-8 md:mt-16 lg:px-8 xl:px-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="related-h" className="font-heading text-[28px]/9 font-extrabold tracking-[-1px] text-charcoal md:text-[36px]/[44px]">
              Related products.
            </h2>
            <ButtonLink href="/our-product" variant="outline" className="h-[46px] px-6 text-body-sm">
              View all products →
            </ButtonLink>
          </div>
          <ul
            className={cn(
              "mt-6 grid gap-6",
              related.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3" : related.length === 2 ? "sm:grid-cols-2 max-w-3xl" : "max-w-sm",
            )}
          >
            {related.map((p) => (
              <li key={p.slug} className="h-full">
                <RelatedCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {testimonial && (
        <section aria-label="Customer testimonial" className="mx-auto mt-14 md:mt-20 w-full max-w-(--container-page) px-5 sm:px-8 lg:px-8 xl:px-16 mb-14 md:mb-20">
          <FeaturedTestimonial t={testimonial} />
        </section>
      )}
    </>
  );
}
