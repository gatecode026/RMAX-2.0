"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/Toast";

interface UserProfileProp {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  department?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  } | null;
}

export function QuoteForm({
  products,
  initialModel,
  initialQuantity,
  currentUser,
}: {
  products: ProductDTO[];
  initialModel?: string;
  initialQuantity?: number;
  currentUser?: UserProfileProp | null;
}) {
  const [done, setDone] = useState(false);
  const [submittedQuoteNumber, setSubmittedQuoteNumber] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const hasAllDetails = Boolean(
    currentUser &&
    currentUser.name?.trim() &&
    currentUser.email?.trim() &&
    currentUser.phone?.trim() &&
    currentUser.organization?.trim()
  );

  // Fast quote state for logged-in users with all details
  const [fastModel, setFastModel] = useState<string>(initialModel || products[0]?.slug || "pro");
  const [fastQuantity, setFastQuantity] = useState<number>(initialQuantity || 1);
  const [fastInstitutionType, setFastInstitutionType] = useState<string>(INSTITUTION_TYPES[0]);
  const [fastDailyUsage, setFastDailyUsage] = useState<string>("100–250 napkins/day");
  const [fastDeliveryCityPostal, setFastDeliveryCityPostal] = useState<string>(() => {
    if (currentUser?.shippingAddress?.city && currentUser?.shippingAddress?.postalCode) {
      return `${currentUser.shippingAddress.city}, ${currentUser.shippingAddress.postalCode}`;
    }
    return currentUser?.shippingAddress?.city || "";
  });
  const [fastSubmitting, setFastSubmitting] = useState(false);

  // Standard form hook for guest or manual entry
  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteRequestInput, unknown, QuoteRequestData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      organizationName: currentUser?.organization || "",
      contactPerson: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      preferredModel: (initialModel || "") as QuoteRequestInput["preferredModel"],
      quantity: initialQuantity || 1,
      expectedDailyUsage: "100–250 napkins/day",
      deliveryCityPostal: currentUser?.shippingAddress?.city
        ? `${currentUser.shippingAddress.city}, ${currentUser.shippingAddress.postalCode || ""}`
        : "",
      useCase: "",
      installationRequirements: "",
    },
  });

  // Automatically reset submitted state and sync model when user switches between product quote requests
  useEffect(() => {
    if (initialModel) {
      setFastModel(initialModel);
      setValue("preferredModel", initialModel as any);
      setDone(false);
      setSubmittedQuoteNumber(null);
    }
  }, [initialModel, setValue]);

  useEffect(() => {
    if (initialQuantity) {
      setFastQuantity(initialQuantity);
      setValue("quantity", initialQuantity);
    }
  }, [initialQuantity, setValue]);

  const selectedInForm = useWatch({ control, name: "preferredModel" });
  const activeModelSlug = (hasAllDetails && !showManualForm) ? fastModel : (selectedInForm || initialModel || products[0]?.slug);
  const preview = products.find((p) => p.slug === activeModelSlug) ?? products.find((p) => p.slug === initialModel) ?? products[0];

  const { success, error: toastError } = useToast();

  // Fast quote submission for logged in users with complete details
  async function handleFastSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setFormError(null);

    const deliveryLoc = fastDeliveryCityPostal.trim() ||
      (currentUser.shippingAddress?.city
        ? `${currentUser.shippingAddress.city}, ${currentUser.shippingAddress.postalCode || ""}`
        : "Direct Institutional Delivery");

    const payload: QuoteRequestData = {
      organizationName: currentUser.organization || "Institutional Client",
      institutionType: (fastInstitutionType || INSTITUTION_TYPES[0]) as any,
      contactPerson: currentUser.name,
      role: currentUser.department || "Procurement",
      email: currentUser.email,
      phone: currentUser.phone || "",
      preferredModel: fastModel as any,
      quantity: Math.max(1, Number(fastQuantity) || 1),
      expectedDailyUsage: fastDailyUsage || "100–250 napkins/day",
      deliveryCityPostal: deliveryLoc,
      useCase: "Institutional Sanitary Hygiene requirement",
      installationRequirements: "Standard site installation",
      consent: true,
    };

    setFastSubmitting(true);
    try {
      const res = await requestJson<{ id: string; quoteNumber: string }>("/api/quote-requests", "POST", payload);
      if (res.ok) {
        setSubmittedQuoteNumber(res.data?.quoteNumber || null);
        setDone(true);
        success(
          "Quote Request Received!",
          `Quotation #${res.data?.quoteNumber || "QT-2026"} has been created and linked to your profile.`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setFormError(res.message);
      toastError("Submission Error", res.message || "Could not submit quotation request.");
    } finally {
      setFastSubmitting(false);
    }
  }

  // Standard form submission
  async function onSubmit(values: QuoteRequestData) {
    setFormError(null);
    const res = await requestJson<{ id: string; quoteNumber: string }>("/api/quote-requests", "POST", values);
    if (res.ok) {
      setSubmittedQuoteNumber(res.data?.quoteNumber || null);
      setDone(true);
      success("Quote Request Sent", "Thank you! Your quotation proposal request has been received.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    applyFieldErrors(setError, res.fields);
    setFormError(res.message);
    toastError("Submission Error", res.message || "Could not submit quotation request.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_366px]">
      {done ? (
        <Card className="p-7 md:p-8" role="status">
          <div className="flex items-center gap-3">
            <Pill tone="success">Request Received</Pill>
            {submittedQuoteNumber && (
              <span className="font-heading font-bold text-navy text-sm">
                Quote #{submittedQuoteNumber}
              </span>
            )}
          </div>
          <h2 className="mt-4 text-title">Thank you! Your quotation request has been received.</h2>
          <p className="mt-3 text-body text-muted">
            Our institutional team will review your requirements and prepare a formal proposal.
            {currentUser && " This request is now tracked in your Quotation History."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {currentUser && (
              <Link
                href="/account#quotations"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-navy px-6 font-semibold text-sm text-white shadow-xs transition hover:bg-navy/90"
              >
                View Quotation History →
              </Link>
            )}
            <Link
              href="/compare-models"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-white px-5 font-semibold text-sm text-charcoal hover:bg-soft"
            >
              Back to compare models
            </Link>
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setSubmittedQuoteNumber(null);
              }}
              className="font-semibold text-navy text-sm underline underline-offset-4"
            >
              Submit another quote
            </button>
          </div>
        </Card>
      ) : hasAllDetails && !showManualForm ? (
        /* FAST QUOTE VIEW FOR USERS WITH COMPLETE PROFILE */
        <Card className="p-7 md:p-8">
          {/* Verified user details badge */}
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                  ✓
                </span>
                <span className="font-heading font-bold text-emerald-950 text-sm">
                  Verified Account Profile Attached
                </span>
              </div>
              <Link
                href="/account"
                className="font-semibold text-xs text-navy underline underline-offset-4 hover:text-navy/80"
              >
                Edit in Profile →
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-muted block">Organization</span>
                <span className="font-semibold text-charcoal text-sm">{currentUser?.organization}</span>
              </div>
              <div>
                <span className="text-muted block">Contact Person</span>
                <span className="font-semibold text-charcoal text-sm">{currentUser?.name}</span>
              </div>
              <div>
                <span className="text-muted block">Mobile Number</span>
                <span className="font-semibold text-charcoal text-sm">{currentUser?.phone}</span>
              </div>
              <div>
                <span className="text-muted block">Email Address</span>
                <span className="font-semibold text-charcoal text-sm">{currentUser?.email}</span>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-emerald-200/60 flex items-center justify-between">
              <p className="text-xs text-muted">
                Need to submit for a different branch or client?
              </p>
              <button
                type="button"
                onClick={() => setShowManualForm(true)}
                className="text-xs font-semibold text-navy underline hover:text-navy/80"
              >
                Switch to full form
              </button>
            </div>
          </div>

          {/* Quick Requirement Selection Form */}
          <form onSubmit={handleFastSubmit} className="flex flex-col gap-6">
            <div>
              <h2 className="text-title">Select Machine &amp; Requirements</h2>
              <p className="text-body-sm text-muted mt-1">
                Choose the model and volume for your institutional proposal.
              </p>
            </div>

            {/* Model Selector Pills */}
            <div className="space-y-2">
              <label className="block font-semibold text-sm text-charcoal">
                Preferred Model *
              </label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {products.map((p) => {
                  const isSelected = fastModel === p.slug;
                  return (
                    <button
                      type="button"
                      key={p.slug}
                      onClick={() => setFastModel(p.slug)}
                      className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                        isSelected
                          ? "border-navy bg-navy/5 ring-2 ring-navy/20 shadow-xs"
                          : "border-line bg-white hover:border-navy/40"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-heading font-bold text-sm text-charcoal">{p.name}</span>
                        {isSelected && <span className="text-xs font-bold text-navy">● Selected</span>}
                      </div>
                      <span className="text-xs text-muted mt-1">{p.specs.dailyCapacity}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setFastModel("help-me-choose")}
                  className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                    fastModel === "help-me-choose"
                      ? "border-navy bg-navy/5 ring-2 ring-navy/20 shadow-xs"
                      : "border-line bg-white hover:border-navy/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-heading font-bold text-sm text-charcoal">Help me choose</span>
                    {fastModel === "help-me-choose" && <span className="text-xs font-bold text-navy">● Selected</span>}
                  </div>
                  <span className="text-xs text-muted mt-1">Our engineer will recommend best fit</span>
                </button>
              </div>
            </div>

            {/* Quantity & Usage */}
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <label className="block font-semibold text-sm text-charcoal mb-2">
                  Quantity Required *
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFastQuantity((q) => Math.max(1, q - 1))}
                    className="flex size-11 items-center justify-center rounded-xl border border-line bg-white font-bold text-charcoal shadow-xs transition hover:bg-soft"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={fastQuantity}
                    onChange={(e) => setFastQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="h-11 w-24 rounded-xl border border-line bg-white text-center font-heading font-bold text-charcoal shadow-xs focus:border-navy focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFastQuantity((q) => q + 1)}
                    className="flex size-11 items-center justify-center rounded-xl border border-line bg-white font-bold text-charcoal shadow-xs transition hover:bg-soft"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sm text-charcoal mb-2">
                  Institution Type *
                </label>
                <select
                  value={fastInstitutionType}
                  onChange={(e) => setFastInstitutionType(e.target.value)}
                  className="h-11 w-full rounded-xl border border-line bg-white px-3 font-medium text-sm text-charcoal shadow-xs focus:border-navy focus:outline-none"
                >
                  {INSTITUTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Daily usage & Delivery destination */}
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <label className="block font-semibold text-sm text-charcoal mb-2">
                  Expected Daily Usage
                </label>
                <select
                  value={fastDailyUsage}
                  onChange={(e) => setFastDailyUsage(e.target.value)}
                  className="h-11 w-full rounded-xl border border-line bg-white px-3 font-medium text-sm text-charcoal shadow-xs focus:border-navy focus:outline-none"
                >
                  <option value="Up to 100 napkins/day">Up to 100 napkins/day</option>
                  <option value="100–250 napkins/day">100–250 napkins/day</option>
                  <option value="250–500 napkins/day">250–500 napkins/day</option>
                  <option value="500+ napkins/day">500+ napkins/day</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-sm text-charcoal mb-2">
                  Delivery City &amp; Postal Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, 400001"
                  value={fastDeliveryCityPostal}
                  onChange={(e) => setFastDeliveryCityPostal(e.target.value)}
                  className="h-11 w-full rounded-xl border border-line bg-white px-3 font-medium text-sm text-charcoal shadow-xs focus:border-navy focus:outline-none"
                />
              </div>
            </div>

            {formError && (
              <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
                {formError}
              </p>
            )}

            <div>
              <Button type="submit" disabled={fastSubmitting} className="w-full sm:w-auto px-8">
                {fastSubmitting ? "Submitting Quotation Request…" : "Submit Institutional Quotation Request"}
              </Button>
              <p className="mt-2 text-xs text-muted">
                Proposal will be sent to {currentUser?.email} and tracked directly in your account.
              </p>
            </div>
          </form>
        </Card>
      ) : (
        /* STANDARD FORM VIEW FOR GUESTS OR MANUAL ENTRY */
        <Card className="p-7 md:p-8">
          {hasAllDetails && showManualForm && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-line bg-soft/70 p-3.5">
              <span className="text-xs text-muted font-medium">
                Showing full entry form.
              </span>
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="text-xs font-semibold text-navy underline hover:text-navy/80"
              >
                ← Back to 1-Click Quick Quote
              </button>
            </div>
          )}

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

          {currentUser && !hasAllDetails && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <p className="font-semibold text-charcoal text-sm">
                Complete your details below
              </p>
              <p className="text-xs text-muted mt-0.5">
                Please provide your organization name and 10-digit mobile number to complete your institutional quote request.
              </p>
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
