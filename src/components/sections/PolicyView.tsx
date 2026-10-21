import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getPolicyPage } from "@/lib/data/content";

/** Long-form policy layout: hero, draft notice, sticky "On this page" TOC and sections. */
export async function PolicyView({ slug, breadcrumb }: { slug: string; breadcrumb: string }) {
  const page = await getPolicyPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero breadcrumb={breadcrumb} eyebrow={page.eyebrow} title={page.title} lead={page.lead} />
      <Container className="mt-12 md:mt-16">
        <Card tone="tint" className="rounded-input px-5 py-4">
          <p className="text-body-sm font-bold">{page.draftNotice.title}</p>
          <p className="mt-2 text-body-sm text-muted">{page.draftNotice.body}</p>
        </Card>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[265px_1fr]">
          <Card className="p-7 lg:sticky lg:top-[calc(var(--header-height)+16px)]">
            <h2 className="text-[20px]/7">On this page</h2>
            <nav aria-label="On this page" className="mt-4">
              <ul className="flex flex-col gap-3">
                {page.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-body-sm text-muted transition hover:text-navy">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <ButtonLink href="/contact-us" variant="secondary" size="sm" className="mt-6 w-full">
              Contact support
            </ButtonLink>
          </Card>

          <Card className="p-7 md:p-9">
            <div className="flex flex-col gap-9">
              {page.sections.map((s) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                  <h2 id={`${s.id}-h`} className="text-title">
                    {s.title}
                  </h2>
                  <p className="mt-3 text-body leading-7 text-muted">{s.body}</p>
                </section>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </>
  );
}
