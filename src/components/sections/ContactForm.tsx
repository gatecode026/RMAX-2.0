"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox, SelectInput, TextArea, TextInput } from "@/components/ui/Field";
import { Pill } from "@/components/ui/Pill";
import { ENQUIRY_TYPES } from "@/lib/enums";
import { applyFieldErrors, requestJson } from "@/lib/client-api";
import { contactSchema, type ContactData, type ContactInput } from "@/lib/validations/schemas";

export function ContactForm({ models }: { models: { slug: string; name: string; capacity: string }[] }) {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { enquiryType: "" as ContactInput["enquiryType"], model: "" },
  });

  async function onSubmit(values: ContactData) {
    setFormError(null);
    const res = await requestJson("/api/contact-messages", "POST", values);
    if (res.ok) {
      setDone(true);
      return;
    }
    applyFieldErrors(setError, res.fields);
    setFormError(res.message);
  }

  if (done) {
    return (
      <Card className="p-7 md:p-8" role="status">
        <Pill tone="success">Message sent</Pill>
        <h2 className="mt-4 text-title">Thank you. We’ve received your message.</h2>
        <p className="mt-3 text-body text-muted">Our team will get back to you about your sales or service enquiry.</p>
        <Link href="/help" className="mt-6 inline-block font-bold text-navy underline underline-offset-4">
          Browse Help &amp; FAQs
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-7 md:p-8">
      <h2 className="text-title">Send us a message</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-5">
        <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
          <SelectInput label="Enquiry type *" error={errors.enquiryType?.message} defaultValue="" {...register("enquiryType")}>
            <option value="" disabled>
              Select enquiry type
            </option>
            {ENQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectInput>
          <SelectInput label="Model (optional)" error={errors.model?.message} {...register("model")}>
            <option value="">Select a model</option>
            {models.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name} · {m.capacity}
              </option>
            ))}
          </SelectInput>
          <TextInput label="Full name *" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <TextInput label="Email *" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <TextInput label="Phone (optional)" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
          <TextInput label="Order reference (optional)" placeholder="e.g. RMAX-DEMO-001" error={errors.orderReference?.message} {...register("orderReference")} />
          <TextArea
            className="md:col-span-2"
            label="Message *"
            placeholder="Include your model, order reference and symptoms for a service question"
            hint="Do not include passwords or full payment details."
            error={errors.message?.message}
            {...register("message")}
          />
        </div>
        <Checkbox
          label={
            <>
              I agree to be contacted about this enquiry. See our{" "}
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
            {isSubmitting ? "Sending…" : "Send message"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
