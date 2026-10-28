"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox, SelectInput, TextInput } from "@/components/ui/Field";
import { Pill } from "@/components/ui/Pill";
import { INDIAN_STATES } from "@/lib/constants";
import { applyFieldErrors, requestJson } from "@/lib/client-api";
import { addressSchema, type AddressInput } from "@/lib/validations/schemas";
import { useToast } from "@/components/ui/Toast";

type Props = {
  kind: "shipping" | "billing";
  initial?: Partial<AddressInput>;
  sameAsShipping?: boolean;
  actionLabel: string;
  heading: string;
  children: React.ReactNode; // read-only view (server-rendered)
};

// ASSUMED: the design shows "Edit address" / "Add / edit billing" buttons but no editor — inline form in the same card.
export function AddressCard({ kind, initial, sameAsShipping = true, actionLabel, heading, children }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [same, setSame] = useState(sameAsShipping);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({ resolver: zodResolver(addressSchema), defaultValues: { country: "India", ...initial } });

  const { success, error } = useToast();

  async function save(values: AddressInput | null) {
    setFormError(null);
    const body = kind === "shipping" ? { shippingAddress: values } : { billingSameAsShipping: same, ...(values ? { billingAddress: values } : {}) };
    const res = await requestJson("/api/account/addresses", "PATCH", body);
    if (res.ok) {
      setEditing(false);
      success("Address Saved", kind === "shipping" ? "Delivery address updated successfully." : "Billing address updated successfully.");
      router.refresh();
      return;
    }
    applyFieldErrors(setError, res.fields);
    setFormError(res.message);
    error("Save Failed", res.message || "Failed to save address");
  }

  const onSubmit = handleSubmit((values) => save(kind === "billing" && same ? null : values));

  return (
    <Card className="p-7">
      <Pill>{heading}</Pill>
      {!editing ? (
        <>
          {children}
          <Button variant="secondary" size="sm" className="mt-6" onClick={() => setEditing(true)}>
            {actionLabel}
          </Button>
        </>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-5 flex flex-col gap-4">
          {kind === "billing" && (
            <Checkbox label="Billing address is the same as shipping" checked={same} onChange={(e) => setSame(e.target.checked)} />
          )}
          {!(kind === "billing" && same) && (
            <>
              <TextInput label="Organization" error={errors.organization?.message} {...register("organization")} />
              <TextInput label="Recipient" error={errors.recipient?.message} {...register("recipient")} />
              <TextInput label="Department" error={errors.department?.message} {...register("department")} />
              <TextInput label="Street address" error={errors.street?.message} {...register("street")} />
              <TextInput label="Address line 2" error={errors.line2?.message} {...register("line2")} />
              <TextInput label="City" error={errors.city?.message} {...register("city")} />
              <SelectInput label="State" error={errors.state?.message} {...register("state")}>
                <option value="" disabled>
                  Select state
                </option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>
              <TextInput label="Postal code" error={errors.postalCode?.message} {...register("postalCode")} />
              <input type="hidden" {...register("country")} />
            </>
          )}
          {formError && (
            <p role="alert" className="rounded-input bg-danger-soft px-4 py-3 text-body-sm font-semibold text-danger">
              {formError}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
