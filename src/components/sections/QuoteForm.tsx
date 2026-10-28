"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox, SelectInput, TextArea, TextInput } from "@/components/ui/Field";
import { Pill } from "@/components/ui/Pill";
import { quoteRequestSchema, type QuoteRequestData, type QuoteRequestInput } from "@/lib/validations/schemas";
import { INSTITUTION_TYPES } from "@/lib/enums";
import { applyFieldErrors, requestJson } from "@/lib/client-api";
import { formatINR } from "@/lib/format";
import type { ProductDTO } from "@/lib/data/content";

export function QuoteForm({
  products,
  initialModel,
  initialQuantity,
  currentUser,
}: {
  products: ProductDTO[];
  initialModel?: string;
  initialQuantity?: number;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    organization?: string;
  } | null;
}) {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestInput, unknown, QuoteRequestData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      organizationName: currentUser?.organization || "",
      contactPerson: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      preferredModel: (initialModel || "") as QuoteRequestInput["preferredModel"],
      quantity: initialQuantity,
      useCase: "",
      installationRequirements: "",
    },
  });

  const selected = useWatch({ control, name: "preferredModel" });
  const preview = products.find((p) => p.slug === selected) ?? products.find((p) => p.slug === initialModel) ?? products[0];

  async function onSubmit(values: QuoteRequestData) {
    setFormError(null);
    const res = await requestJson("/api/quote-requests", "POST", values);
    if (res.ok) {
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    applyFieldErrors(setError, res.fields);
    setFormError(res.message);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_366px]">
      {done ? (
        <Card className="p-7 md:p-8" role="status">
          <Pill tone="success">Request sent</Pill>
          <h2 className="mt-4 text-title">Thank you. Your quote request has been received.</h2>
          <p className="mt-3 text-body text-muted">
            Our team will be in touch to discuss capacity, model choice and installation for your institution.
          </p>
          <Link href="/compare-models" className="mt-6 inline-block font-bold text-navy underline underline-offset-4">
            Back to compare models
          </Link>
        </Card>
      ) : (
        <Card className="p-7 md:p-8">
          {!currentUser && (
            <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-white text-sm">
                  !
                </span>
                <div>
                  <p className="font-semibold text-charcoal text-sm">
                    Already have an account? Sign in for instant tracking
                  </p>
                  <p className="text-xs text-muted">
                    Sign in to automatically link this quotation proposal directly to your profile.
                  </p>
                </div>
              </div>
              <Link
                href={`/login?next=${encodeURIComponent("/institutional-quote")}`}
                className="shrink-0 rounded-xl bg-navy px-4 py-2 font-semibold text-xs text-white shadow-xs transition hover:bg-navy/90"
              >
                Log In / Register
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
            <h2 className="text-title">Organization &amp; contact</h2>
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <TextInput label="Organization name *" autoComplete="organization" error={errors.organizationName?.message} {...register("organizationName")} />
              <SelectInput label="Institution type *" error={errors.institutionType?.message} defaultValue="" {...register("institutionType")}>
                <option value="" disabled>
                  Select institution type
                </option>
                {INSTITUTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectInput>
              <p className="text-body text-muted md:col-span-2">{INSTITUTION_TYPES.join(" · ")}</p>
              <TextInput label="Contact person *" autoComplete="name" error={errors.contactPerson?.message} {...register("contactPerson")} />
              <TextInput label="Role / department" autoComplete="organization-title" error={errors.role?.message} {...register("role")} />
              <TextInput label="Email *" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
              <TextInput label="Mobile Number *" type="tel" autoComplete="tel" placeholder="10-digit mobile number" error={errors.phone?.message} {...register("phone")} />
            </div>

            <h2 className="mt-2 text-title">Your requirement</h2>
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <SelectInput label="Preferred model *" error={errors.preferredModel?.message} defaultValue="" {...register("preferredModel")}>
                <option value="" disabled>
                  Select preferred model
                </option>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} · {p.specs.dailyCapacity}
                  </option>
                ))}
                <option value="help-me-choose">Help me choose</option>
              </SelectInput>
              <TextInput label="Quantity *" type="number" min={1} inputMode="numeric" error={errors.quantity?.message} {...register("quantity")} />
              <TextInput label="Expected daily usage *" placeholder="Approximate number of napkins" error={errors.expectedDailyUsage?.message} {...register("expectedDailyUsage")} />
              <TextInput label="Delivery city & postal code *" autoComplete="postal-code" error={errors.deliveryCityPostal?.message} {...register("deliveryCityPostal")} />
              <TextArea className="md:col-span-2" label="Use case & number of locations (optional)" placeholder="Describe where and how the units will be used" error={errors.useCase?.message} {...register("useCase")} />
              <TextArea className="md:col-span-2" label="Installation requirements (optional)" placeholder="Site readiness, placement questions and any installation support needed" error={errors.installationRequirements?.message} {...register("installationRequirements")} />
            </div>

            <Checkbox
              label={
                <>
                  I agree to be contacted about this quote request. See our{" "}
                  <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-navy">
                    Privacy Policy
                  </Link>
                  .
                </>
              }
              error={errors.consent?.message}
              {...register("consent")}
            />

            {formError && (
              <p role="alert" className="rounded-input bg-danger-soft px-4 py-3 text-body-sm font-semibold text-danger">
                {formError}
              </p>
            )}
            <div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Request institutional quote"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <aside className="flex flex-col gap-6" aria-label="About institutional sales">
        <div className="rounded-card bg-charcoal p-7 text-white">
          <Pill tone="light">Institutional sales</Pill>
          <h2 className="mt-5 text-title text-white">One unit or multiple locations.</h2>
          <p className="mt-5 text-body text-muted-dark">
            A quote lets you discuss deployment details before purchasing. Final requirements and installation arrangements should be
            confirmed with the team.
          </p>
        </div>
        {preview && (
          <Card className="p-7">
            <Image src={preview.image.src} alt={preview.image.alt} width={310} height={220} className="h-[220px] w-full rounded-[24px] object-cover" />
            <p className="mt-6 font-heading text-title font-extrabold">
              {preview.name} · {formatINR(preview.price)}
            </p>
            <p className="mt-4 text-body text-muted">
              {[preview.specs.power, preview.specs.weight, preview.specs.batchCapacity !== "Not specified" && preview.specs.batchCapacity]
                .filter(Boolean)
                .join(" · ")}
              <br />
              Free shipping · {preview.specs.warranty} warranty
            </p>
            <p className="mt-6 text-body text-muted">Need help choosing? Select “Help me choose” in the model field.</p>
          </Card>
        )}
      </aside>
    </div>
  );
}
