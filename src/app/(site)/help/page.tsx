import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HelpFaqList } from "@/components/sections/HelpFaqList";
import { getFaqItems } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Help & FAQs",
  description: "Find help with choosing, using and caring for your RMAX machine, or send your question to the sales or service team.",
};

export default async function HelpPage() {
  const faqs = await getFaqItems();
  const categories = [...new Set(faqs.map((f) => f.category))]; // one link per category

  return (
    <>
      <PageHero
        breadcrumb="Help & FAQs"
        eyebrow="Help & FAQs"
        title="Clear answers. Everyday support."
        lead="Find help with choosing, using and caring for your RMAX machine, or send your question to the sales or service team."
      />

      <Container className="mt-12 grid grid-cols-[minmax(0,1fr)] items-start gap-8 md:mt-16 lg:grid-cols-[228px_minmax(0,1fr)]">
        <Card className="p-5 sm:p-7 lg:sticky lg:top-[calc(var(--header-height)+16px)]">
          <h2 className="text-title">Browse help</h2>
          <nav aria-label="Help categories" className="mt-4">
            <ul className="flex flex-col gap-1">
              {categories.map((c) => (
                <li key={c}>
                  <a href={`#${c.toLowerCase()}`} className="block py-1.5 text-body text-muted transition hover:text-navy">
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ButtonLink href="/contact-us" className="mt-6 w-full">
            Contact support
          </ButtonLink>
        </Card>

        <HelpFaqList faqs={faqs} />
      </Container>

      <Container className="mt-12">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[24px] sm:rounded-card bg-charcoal p-5 sm:p-8 text-white md:flex-row md:items-center">
          <div>
            <h2 className="text-title text-white">Still have a question?</h2>
            <p className="mt-2 text-body text-muted-dark">
              Use the contact form for a sales or service enquiry. Include your model and order reference if you already own a unit.
            </p>
          </div>
          <ButtonLink href="/contact-us" variant="dark" className="w-full sm:w-auto shrink-0 text-center">
            Contact Us
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
