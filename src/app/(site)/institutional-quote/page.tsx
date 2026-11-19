import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { getFamilies, getProducts } from "@/lib/data/content";

import { getCurrentUserProfile } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Request Institutional Quote",
  description: "Share the scale of your requirement and we’ll help you discuss capacity, model choice and installation for your institution.",
};

type QuoteSearch = Promise<{ model?: string; qty?: string; type?: string }>;

async function QuoteContent({ searchParams }: { searchParams: QuoteSearch }) {
  const [products, families, user, { model, qty, type }] = await Promise.all([
    getProducts(),
    getFamilies(),
    getCurrentUserProfile(),
    searchParams,
  ]);
  const valid = products.some((p) => p.slug === model);
  const quantity = Math.min(Math.max(Number.parseInt(qty ?? "", 10) || 1, 1), 999);
  const fallbackModel = products.find((p) => p.slug === "pro")?.slug ?? "help-me-choose";
  return (
    <QuoteForm
      key={`${valid ? model! : fallbackModel}-${quantity}-${type ?? ""}`}
      products={products}
      families={families}
      initialModel={valid ? model! : fallbackModel}
      initialQuantity={quantity}
      initialType={valid ? type?.slice(0, 40) : undefined}
      currentUser={user ? {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        organization: user.organization || "",
        department: user.department || "",
        shippingAddress: user.shippingAddress || null,
      } : null}
    />
  );
}

export default function InstitutionalQuotePage({ searchParams }: { searchParams: QuoteSearch }) {
  return (
    <>
      <PageHero
        breadcrumb="Institutional Quote"
        eyebrow="Institutional Quote"
        title="Plan your next hygiene upgrade."
        lead="Share the scale of your requirement. We’ll help you discuss capacity, model choice and installation for your institution."
      />
      <Container className="mt-12 md:mt-16">
        <Suspense fallback={<div className="h-[900px] animate-pulse rounded-card bg-soft/70" />}>
          <QuoteContent searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}
