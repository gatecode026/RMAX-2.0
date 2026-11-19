"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/Field";
import { ResetCodeForm } from "@/components/auth/ResetCodeForm";
import { applyFieldErrors, requestJson } from "@/lib/client-api";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/schemas";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);
    const res = await requestJson<{ email: string }>("/api/auth/forgot-password", "POST", values);
    if (res.ok) return setSentTo(res.data.email);
    applyFieldErrors(setError, res.fields);
    setFormError(res.message);
  }

  return (
    <Card className="p-7">
      <h2 className="text-[28px]/9">Forgot password?</h2>
      <p className="mt-4 text-body-sm text-muted">We’ll email a 6-digit code if this email is registered with an account.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 flex flex-col gap-5">
        <TextInput label="Account email *" type="email" placeholder="facilities@example.org" autoComplete="email" error={errors.email?.message} {...register("email")} />
        {formError && (
          <p role="alert" className="rounded-input bg-danger-soft px-4 py-3 text-body-sm font-semibold text-danger">
            {formError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset code"}
        </Button>
      </form>

      <div className="mt-6 border-t border-line pt-6">
        {sentTo && <ResetCodeForm email={sentTo} onDone={() => (window.location.href = "/login")} />}
        <p className={sentTo ? "mt-5 text-body-sm text-muted" : "text-body-sm text-muted"}>
          Still need help? Use the contact form without sharing your password.
        </p>
        <ButtonLink href="/login" variant="secondary" className="mt-4 w-full">
          Back to Login
        </ButtonLink>
      </div>
    </Card>
  );
}
