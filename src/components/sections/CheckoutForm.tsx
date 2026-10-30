"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Check } from "lucide-react";
import { INDIAN_STATES } from "@/lib/constants";
import { applyFieldErrors, requestJson } from "@/lib/client-api";
import { formatINR } from "@/lib/format";
import { checkoutSchema, PAYMENT_METHODS, type CheckoutData, type CheckoutInput } from "@/lib/validations/schemas";
import { cn } from "@/lib/cn";

type Props = {
  summary: { lines: { quantity: number; shortName: string }[]; subtotal: number; shipping: number; total: number; description: string };
  defaults?: Partial<CheckoutInput>;
  loggedIn: boolean;
};

/* Reusable Form Field matching exact Figma 11 Checkout specifications */
function FieldWrapper({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-2 w-full", className)}>
      <label className="font-sans font-bold text-[14px] leading-[19px] text-[#0F172A]">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-[12px] font-semibold text-danger leading-none mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutForm({ summary, defaults, loggedIn }: Props) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput, unknown, CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "India",
      billingSameAsShipping: true,
      paymentMethod: PAYMENT_METHODS[0],
      state: "",
      ...defaults,
    },
  });
  const sameBilling = useWatch({ control, name: "billingSameAsShipping" });

  async function onSubmit(values: CheckoutData) {
    setFormError(null);
    const res = await requestJson<{ reference: string }>("/api/orders", "POST", values);
    if (res.ok) {
      router.push(`/order-confirmation/${res.data.reference}`);
      return;
    }
    applyFieldErrors(setError, res.fields);
    setFormError(res.message);
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[786px_370px]">
      {/* Left Column: Guest checkout form (786px on desktop) */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        {/* Card 1: Contact details */}
        <div className="box-border flex flex-col items-start p-7 gap-5 w-full bg-white border border-[#94A3B8]/20 rounded-[30px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          {/* Top Row: Checkout identity */}
          <div className="flex items-center justify-between w-full h-[50px]">
            <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3.5 py-1.5 font-sans font-extrabold text-[12px] leading-4 text-[#0B62FF] uppercase tracking-wider">
              {loggedIn ? "SIGNED IN" : "GUEST CHECKOUT"}
            </span>
            {!loggedIn && (
              <Link
                href="/login?next=/checkout"
                className="flex items-center justify-center h-[50px] px-5 rounded-full bg-white border border-[rgba(11,98,255,0.18)] font-sans font-bold text-[14px] text-[#0B62FF] hover:bg-[#F0F5FF] transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          <h2 className="font-jakarta text-[24px]/[28px] font-extrabold text-[#020618]">
            Contact details
          </h2>

          <div className="grid w-full gap-6 md:grid-cols-2">
            <FieldWrapper label="Full name *" error={errors.fullName?.message}>
              <input
                type="text"
                autoComplete="name"
                placeholder="Full name *"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.fullName ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("fullName")}
              />
            </FieldWrapper>

            <FieldWrapper label="Email *" error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                placeholder="Email *"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.email ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("email")}
              />
            </FieldWrapper>

            <FieldWrapper label="Phone for delivery *" error={errors.phone?.message} className="md:col-span-2">
              <input
                type="tel"
                autoComplete="tel"
                maxLength={10}
                inputMode="numeric"
                placeholder="10-digit mobile number *"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.phone ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("phone", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  },
                })}
              />
            </FieldWrapper>
          </div>
        </div>

        {/* Card 2: Institutional shipping details */}
        <div className="box-border flex flex-col items-start p-7 gap-5 w-full bg-white border border-[#94A3B8]/20 rounded-[30px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <h2 className="font-jakarta text-[24px]/[28px] font-extrabold text-[#020618]">
            Institutional shipping details
          </h2>

          <div className="grid w-full gap-6 md:grid-cols-2">
            <FieldWrapper label="Organization / institution *" error={errors.organization?.message}>
              <input
                type="text"
                autoComplete="organization"
                placeholder="Organization / institution *"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.organization ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("organization")}
              />
            </FieldWrapper>

            <FieldWrapper label="Department / recipient *" error={errors.department?.message}>
              <input
                type="text"
                placeholder="Department / recipient *"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.department ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("department")}
              />
            </FieldWrapper>

            <FieldWrapper label="Street address *" error={errors.street?.message} className="md:col-span-2">
              <input
                type="text"
                autoComplete="address-line1"
                placeholder="Building, street and delivery location"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.street ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("street")}
              />
            </FieldWrapper>

            <FieldWrapper label="Address line 2" error={errors.line2?.message} className="md:col-span-2">
              <input
                type="text"
                autoComplete="address-line2"
                placeholder="Optional landmark or unit number"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.line2 ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("line2")}
              />
            </FieldWrapper>

            <FieldWrapper label="City *" error={errors.city?.message}>
              <input
                type="text"
                autoComplete="address-level2"
                placeholder="City *"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.city ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("city")}
              />
            </FieldWrapper>

            <FieldWrapper label="State *" error={errors.state?.message}>
              <div className="relative w-full">
                <select
                  className={cn(
                    "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 pr-10 font-sans text-[14px] text-[#0F172A] focus:outline-none transition-colors appearance-none cursor-pointer",
                    errors.state ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                  )}
                  {...register("state")}
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#64748B] pointer-events-none" />
              </div>
            </FieldWrapper>

            <FieldWrapper label="Postal code *" error={errors.postalCode?.message}>
              <input
                type="text"
                autoComplete="postal-code"
                placeholder="Postal code *"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.postalCode ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("postalCode")}
              />
            </FieldWrapper>

            <FieldWrapper label="Country *" error={errors.country?.message}>
              <div className="relative w-full">
                <select
                  className={cn(
                    "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 pr-10 font-sans text-[14px] text-[#0F172A] focus:outline-none transition-colors appearance-none cursor-pointer",
                    errors.country ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                  )}
                  {...register("country")}
                >
                  <option value="India">India</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#64748B] pointer-events-none" />
              </div>
            </FieldWrapper>

            <FieldWrapper label="Delivery / installation notes" error={errors.notes?.message} className="md:col-span-2">
              <textarea
                rows={3}
                placeholder="Site contact, receiving hours or installation questions"
                className={cn(
                  "h-[112px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors resize-none",
                  errors.notes ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("notes")}
              />
            </FieldWrapper>
          </div>
        </div>

        {/* Card 3: Billing details */}
        <div className="box-border flex flex-col items-start p-7 gap-5 w-full bg-white border border-[#94A3B8]/20 rounded-[30px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <h2 className="font-jakarta text-[24px]/[28px] font-extrabold text-[#020618]">
            Billing details
          </h2>

          {/* Consent Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="size-4 rounded-[4px] border border-[#64748B] text-[#0284C7] focus:ring-0 cursor-pointer accent-[#0284C7]"
              {...register("billingSameAsShipping")}
            />
            <span className="font-sans text-[14px]/[23px] text-[#62748E]">
              Billing address is the same as shipping
            </span>
          </label>

          <div className="grid w-full gap-6 md:grid-cols-2">
            <FieldWrapper label="Billing organization *" error={errors.billingOrganization?.message}>
              <input
                type="text"
                placeholder="Billing organization *"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.billingOrganization ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("billingOrganization")}
              />
            </FieldWrapper>

            <FieldWrapper label="Purchase order reference (optional)" error={errors.poReference?.message}>
              <input
                type="text"
                placeholder="Purchase order reference (optional)"
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 font-sans text-[14px] text-[#0F172A] placeholder:text-[#62748E] focus:outline-none transition-colors",
                  errors.poReference ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("poReference")}
              />
            </FieldWrapper>
          </div>

          <p className="font-sans text-[14px]/[23px] text-[#62748E]">
            {sameBilling
              ? "Uncheck to enter a different institutional billing address. "
              : "Enter your institutional billing details. "}
            Invoice requirements can be included in order notes.
          </p>
        </div>

        {/* Card 4: Payment & review */}
        <div className="box-border flex flex-col items-start p-7 gap-5 w-full bg-white border border-[#94A3B8]/20 rounded-[30px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <h2 className="font-jakarta text-[24px]/[28px] font-extrabold text-[#020618]">
            Payment &amp; review
          </h2>

          <FieldWrapper label="Payment method · illustrative" error={errors.paymentMethod?.message}>
            <div className="relative w-full">
              <select
                className={cn(
                  "h-[56px] w-full rounded-[14px] border bg-white px-4 py-3 pr-10 font-sans text-[14px] text-[#0F172A] focus:outline-none transition-colors appearance-none cursor-pointer",
                  errors.paymentMethod ? "border-danger focus:border-danger" : "border-[#E2E8F0] focus:border-[#0B62FF]"
                )}
                {...register("paymentMethod")}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#64748B] pointer-events-none" />
            </div>
          </FieldWrapper>

          <p className="font-sans text-[14px]/[23px] text-[#62748E]">
            Payment selection is shown for layout review only. Available methods and invoice details need confirmation before publication. No provider or payment transaction is assumed.
          </p>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded-[4px] border border-[#64748B] text-[#0284C7] focus:ring-0 cursor-pointer accent-[#0284C7]"
              {...register("terms")}
            />
            <span className="font-sans text-[14px]/[23px] text-[#62748E]">
              I agree to the{" "}
              <Link href="/terms-and-conditions" className="text-[#0B62FF] hover:underline underline-offset-4">
                Terms &amp; Conditions
              </Link>{" "}
              and have read{" "}
              <Link href="/shipping-exchanges-warranty" className="text-[#0B62FF] hover:underline underline-offset-4">
                Shipping, Exchanges &amp; Warranty
              </Link>{" "}
              and the{" "}
              <Link href="/privacy-policy" className="text-[#0B62FF] hover:underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.terms && (
            <p role="alert" className="text-[12px] font-semibold text-danger -mt-2">
              {errors.terms.message}
            </p>
          )}

          {formError && (
            <p role="alert" className="w-full rounded-[14px] bg-danger-soft px-4 py-3 font-sans text-[14px] font-semibold text-danger">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center h-[50px] px-8 rounded-full bg-gradient-to-r from-[#0B62FF] to-[#0EA5E9] font-sans font-bold text-[14px] text-white shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer self-start"
          >
            {isSubmitting ? "Placing order…" : `Place order · ${formatINR(summary.total)}`}
          </button>
        </div>
      </form>

      {/* Right Column: Checkout summary (370px on desktop) */}
      <aside className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--header-height)+16px)]" aria-label="Order summary">
        {/* Card 1: Order summary */}
        <div className="box-border flex flex-col p-7 gap-5 w-full bg-white border border-[#94A3B8]/20 rounded-[30px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <h2 className="font-jakarta text-[24px]/[28px] font-extrabold text-[#020618]">
            Order summary
          </h2>

          <ul className="flex flex-col gap-2 font-sans text-[14px] text-[#62748E]">
            {summary.lines.map((l) => (
              <li key={l.shortName}>
                {l.quantity} × {l.shortName}
              </li>
            ))}
          </ul>

          <div className="h-[1px] w-full bg-[#E2E8F0]" />

          <div className="flex items-center justify-between font-sans text-[14px]">
            <span className="font-bold text-[#0F172A]">Subtotal</span>
            <span className="font-bold text-[#0F172A]">{formatINR(summary.subtotal)}</span>
          </div>

          <div className="flex items-center justify-between font-sans text-[14px]">
            <span className="font-bold text-[#0F172A]">Shipping</span>
            <span className="font-bold text-[#0B62FF]">
              {summary.shipping === 0 ? "Free" : formatINR(summary.shipping)}
            </span>
          </div>

          <div className="h-[1px] w-full bg-[#E2E8F0]" />

          <div className="flex items-center justify-between">
            <span className="font-sans font-bold text-[14px] text-[#0F172A]">Total</span>
            <span className="font-jakarta font-extrabold text-[28px]/[35px] text-[#020618]">
              {formatINR(summary.total)}
            </span>
          </div>

          <p className="font-sans text-[14px]/[23px] text-[#62748E]">
            No tax rate is assumed in this illustrative order.
          </p>

          <p className="font-sans text-[14px]/[23px] text-[#62748E]">
            Free shipping · 3–5 day delivery
            <br />
            1 year warranty · Exchange only
          </p>
        </div>

        {/* Card 2: Notice card */}
        <div className="flex flex-col p-5 gap-1.5 w-full bg-[#EFF6FF] rounded-[18px]">
          <p className="font-sans font-bold text-[14px] text-[#0F172A]">
            Illustrative order
          </p>
          <p className="font-sans text-[14px]/[23px] text-[#62748E]">
            {summary.description}. Free shipping · {formatINR(summary.total)} total. No tax rate or payment provider is assumed.
          </p>
        </div>

        {/* Promo text + Request a quote button */}
        <div className="flex flex-col gap-4 w-full">
          <p className="font-sans text-[14px]/[23px] text-[#62748E]">
            Need an institutional quote instead? Use the quote form to discuss multi-unit purchases and installation.
          </p>
          <Link
            href="/institutional-quote"
            className="flex items-center justify-center h-[50px] w-full rounded-full bg-white border border-[rgba(11,98,255,0.18)] font-sans font-bold text-[14px] text-[#0B62FF] hover:bg-[#F0F5FF] transition-colors"
          >
            Request a quote
          </Link>
        </div>
      </aside>
    </div>
  );
}
