import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/sections/ContactForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { getProducts } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Use the contact form for a sales or service enquiry. Include your model and order reference if you already own a unit.",
};

export default async function ContactUsPage() {
  const products = await getProducts();
  return (
    <>
      <PageHero
        breadcrumb="Contact Us"
        eyebrow="Contact Us"
        title="We’re here to help."
        lead="Use the contact form for a sales or service enquiry. Include your model and order reference if you already own a unit."
      />

      <Container className="mt-12 grid items-start gap-6 md:mt-16 lg:grid-cols-[1fr_366px]">
        <ContactForm models={products.map((p) => ({ slug: p.slug, name: p.name, capacity: p.specs.dailyCapacity }))} />

        <aside className="flex flex-col gap-6" aria-label="Other ways to get help">
          <div className="rounded-card bg-charcoal p-7 text-white">
            <Pill tone="light">Sales &amp; service</Pill>
            <h2 className="mt-5 text-title text-white">Which should I choose?</h2>
            <p className="mt-4 text-body text-muted-dark">
              Choose <strong className="text-white">Service</strong> for delivery, exchange or warranty enquiries and include your
              order reference and model. Choose <strong className="text-white">Sales</strong> for model selection.
            </p>
          </div>
          <Card className="p-7">
            <h2 className="text-[20px]/7">Planning more than one unit?</h2>
            <p className="mt-3 text-body-sm text-muted">
              Request an institutional quote to discuss model choice, quantities and installation requirements.
            </p>
            <ButtonLink href="/institutional-quote" variant="secondary" size="sm" className="mt-5">
              Request institutional quote
            </ButtonLink>
            <p className="mt-6 text-body-sm text-muted">Looking for quick answers? Browse our Help &amp; FAQs.</p>
            <ButtonLink href="/help" variant="ghost" size="sm" className="mt-2 -ml-6">
              Help &amp; FAQs
            </ButtonLink>
          </Card>
        </aside>
      </Container>
    </>
  );
}
