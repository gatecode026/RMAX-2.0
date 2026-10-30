import { redirect } from "next/navigation";

/**
 * PRD-suggested guest quotation route. Reuses the existing /institutional-quote page and its
 * QuoteForm — which already fully implements the guest quotation workflow (no login required,
 * product/model/quantity prefill, server-side validation, admin visibility) — rather than
 * duplicating it under a second URL.
 */
export default async function RequestQuotationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") qs.set(key, value);
  }
  const suffix = qs.toString();
  redirect(`/institutional-quote${suffix ? `?${suffix}` : ""}`);
}
