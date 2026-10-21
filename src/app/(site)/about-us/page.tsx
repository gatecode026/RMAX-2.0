import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { INSTITUTION_TYPES } from "@/lib/enums";
import { getProducts } from "@/lib/data/content";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "About Us",
  description: "RMAX Solutions — hygiene technology. Advanced hygiene devices and products, manufactured in-house.",
};

const VALUES = [
  { title: "In-house manufacturing", body: "RMAX machines are manufactured in-house." },
  { title: "Free shipping", body: "Free shipping and a 3–5 day delivery window on every model." },
  { title: "1 year warranty", body: "All models include a 1 year warranty, with support through the service contact form." },
  { title: "Straightforward support", body: "An exchange-only policy and low-maintenance machines — read the details in Shipping, Exchanges & Warranty." },
] as const;

export default async function AboutUsPage() {
  const products = await getProducts();
  return (
    <>
      <PageHero
        breadcrumb="About Us"
        eyebrow="About Us"
        title="Let’s build a better world."
        lead="RMAX Solutions — hygiene technology. We make advanced hygiene devices and products, manufactured in-house."
      />

      <Container className="mt-12 grid items-start gap-6 md:mt-16 lg:grid-cols-[1fr_1fr]">
        <Card className="p-7 md:p-8">
          <h2 className="text-title">What we make</h2>
          <p className="mt-4 text-body text-muted">
            A range of sanitary napkin incinerators — Basic, Pro and Pro-Max. Each uses an enclosed high-temperature chamber with a
            supplied cycle of 3–4 minutes, and is built for low maintenance.
          </p>
        </Card>
        <Card className="p-7 md:p-8">
          <h2 className="text-title">Who we make it for</h2>
          <p className="mt-4 text-body text-muted">
            Institutions with real, daily usage: {INSTITUTION_TYPES.join(", ").toLowerCase()}. Choose around your expected usage, or
            request help if you are unsure.
          </p>
        </Card>
      </Container>

      <Container className="mt-16 md:mt-24">
        <SectionHeading eyebrow="What you can expect" title="The same standard on every model." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <li key={v.title}>
              <Card tone="tint" className="h-full p-6">
                <h3 className="text-[20px]/7">{v.title}</h3>
                <p className="mt-3 text-body-sm text-muted">{v.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="mt-16 md:mt-24">
        <SectionHeading eyebrow="Our products" title="Basic, Pro and Pro-Max." />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <li key={p.slug}>
              <Link href="/compare-models" className="group block rounded-card focus-visible:outline-offset-4">
                <Card className="p-5 transition group-hover:border-navy">
                  <Image src={p.image.src} alt={p.image.alt} width={280} height={190} className="h-[190px] w-full rounded-[24px] object-cover" />
                  <p className="mt-5 font-heading text-title font-extrabold">
                    {p.name} · {formatINR(p.price)}
                  </p>
                  <p className="mt-1 text-body-sm text-muted">{p.specs.dailyCapacity}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="mt-16 md:mt-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-card-lg bg-charcoal p-8 text-white md:flex-row md:items-center md:p-10">
          <div className="max-w-[640px]">
            <h2 className="text-title text-white">Talk to the team.</h2>
            <p className="mt-3 text-body text-muted-dark">
              Use the contact form for a sales or service enquiry, or request an institutional quote for multi-unit purchases and
              installation planning.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <ButtonLink href="/contact-us" variant="dark">
              Contact Us
            </ButtonLink>
            <ButtonLink href="/institutional-quote" variant="dark">
              Request quote
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}
