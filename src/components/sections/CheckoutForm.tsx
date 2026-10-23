"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox, SelectInput, TextArea, TextInput } from "@/components/ui/Field";
import { Pill } from "@/components/ui/Pill";
import { OrderSummary } from "@/components/sections/OrderParts";
import { INDIAN_STATES } from "@/lib/constants";
import { applyFieldErrors, requestJson } from "@/lib/client-api";
import { formatINR } from "@/lib/format";
import { checkoutSchema, PAYMENT_METHODS, type CheckoutData, type CheckoutInput } from "@/lib/validations/schemas";

type Props = {
  summary: { lines: { quantity: number; shortName: string }[]; subtotal: number; shipping: number; total: number; description: string };
  defaults?: Partial<CheckoutInput>;
  loggedIn: boolean;
};

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
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_286px]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <Card className="p-6 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <Pill>{loggedIn ? "Signed in" : "Guest checkout"}</Pill>
            {!loggedIn && (
              <ButtonLink href="/login?next=/checkout" variant="secondary" size="xs">
                Login
              </ButtonLink>
            )}
          </div>
          <h2 className="mt-4 text-title">Contact details</h2>
          <div className="mt-4 grid gap-x-5 gap-y-5 md:grid-cols-2">
            <TextInput label="Full name *" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
            <TextInput label="Email *" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
            <TextInput className="md:col-span-2" label="Phone for delivery *" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <h2 className="text-title">Institutional shipping details</h2>
          <div className="mt-4 grid gap-x-5 gap-y-5 md:grid-cols-2">
            <TextInput label="Organization / institution *" autoComplete="organization" error={errors.organization?.message} {...register("organization")} />
            <TextInput label="Department / recipient *" error={errors.department?.message} {...register("department")} />
            <TextInput className="md:col-span-2" label="Street address *" placeholder="Building, street and delivery location" autoComplete="address-line1" error={errors.street?.message} {...register("street")} />
            <TextInput className="md:col-span-2" label="Address line 2" placeholder="Optional landmark or unit number" autoComplete="address-line2" error={errors.line2?.message} {...register("line2")} />
            <TextInput label="City *" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
            <SelectInput label="State *" error={errors.state?.message} {...register("state")}>
              <option value="" disabled>
                Select state
              </option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
            <TextInput label="Postal code *" autoComplete="postal-code" error={errors.postalCode?.message} {...register("postalCode")} />
            <SelectInput label="Country *" error={errors.country?.message} {...register("country")}>
              <option value="India">India</option>
            </SelectInput>
            <TextArea className="md:col-span-2" label="Delivery / installation notes" placeholder="Site contact, receiving hours or installation questions" error={errors.notes?.message} {...register("notes")} />
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <h2 className="text-title">Billing details</h2>
          <Checkbox className="mt-4" label="Billing address is the same as shipping" {...register("billingSameAsShipping")} />
          <div className="mt-4 grid gap-x-5 gap-y-5 md:grid-cols-2">
            <TextInput label="Billing organization *" error={errors.billingOrganization?.message} {...register("billingOrganization")} />
            <TextInput label="Purchase order reference (optional)" error={errors.poReference?.message} {...register("poReference")} />
          </div>
          <p className="mt-4 text-body-sm text-muted">
            {sameBilling ? "Uncheck to enter a different institutional billing address. " : "Enter your institutional billing details. "}
            Invoice requirements can be included in order notes.
          </p>
        </Card>

        <Card className="p-6 md:p-7">
          <h2 className="text-title">Payment &amp; review</h2>
          <div className="mt-4">
            <SelectInput label="Payment method · illustrative" error={errors.paymentMethod?.message} {...register("paymentMethod")}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </SelectInput>
          </div>
          <p className="mt-4 text-body-sm text-muted">
            Payment selection is shown for layout review only. Available methods and invoice details need confirmation before publication.
            No provider or payment transaction is assumed.
          </p>
          <Checkbox
            className="mt-4"
            label={
              <span className="text-body-sm">
                I agree to the{" "}
                <Link href="/terms-and-conditions" className="underline underline-offset-4 hover:text-navy">
                  Terms &amp; Conditions
                </Link>{" "}
                and have read{" "}
                <Link href="/shipping-exchanges-warranty" className="underline underline-offset-4 hover:text-navy">
                  Shipping, Exchanges &amp; Warranty
                </Link>{" "}
                and the{" "}
                <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-navy">
                  Privacy Policy
                </Link>
                .
              </span>
            }
            error={errors.terms?.message}
            {...register("terms")}
          />
          {formError && (
            <p role="alert" className="mt-4 rounded-input bg-danger-soft px-4 py-3 text-body-sm font-semibold text-danger">
              {formError}
            </p>
          )}
          <Button type="submit" className="mt-5" disabled={isSubmitting}>
            {isSubmitting ? "Placing order…" : `Place order · ${formatINR(summary.total)}`}
          </Button>
        </Card>
      </form>

      <aside className="flex flex-col gap-5 lg:sticky lg:top-[calc(var(--header-height)+16px)]" aria-label="Order summary">
        <OrderSummary lines={summary.lines} subtotal={summary.subtotal} shipping={summary.shipping} total={summary.total} />
        <Card tone="tint" className="rounded-input p-5">
          <p className="text-body-sm font-bold">Illustrative order</p>
          <p className="mt-2 text-body-sm text-muted">
            {summary.description}. Free shipping · {formatINR(summary.total)} total. No tax rate or payment provider is assumed.
          </p>
        </Card>
        <p className="text-body-sm text-muted">Need an institutional quote instead? Use the quote form to discuss multi-unit purchases and installation.</p>
        <ButtonLink href="/institutional-quote" variant="secondary">
          Request a quote
        </ButtonLink>
      </aside>
    </div>
  );
}
