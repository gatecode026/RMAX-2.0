"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox, TextInput } from "@/components/ui/Field";
import { loginAction } from "@/lib/actions/auth";
import { applyFieldErrors, requestJson } from "@/lib/client-api";
import { registerSchema, type RegisterInput } from "@/lib/validations/schemas";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const res = await requestJson("/api/auth/register", "POST", values);
    if (!res.ok) {
      applyFieldErrors(setError, res.fields);
      return setFormError(res.message);
    }
    // Sign the new user straight in.
    const login = await loginAction({ email: values.email, password: values.password });
    router.push(login.ok ? "/account" : "/login");
    router.refresh();
  }

  return (
    <Card className="p-7">
      <h2 className="text-[28px]/9">Create your account</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 flex flex-col gap-5">
        <TextInput label="Full name *" placeholder="Full name *" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <TextInput label="Email address *" type="email" placeholder="Email address *" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <TextInput label="Organization (optional)" placeholder="Organization (optional)" autoComplete="organization" error={errors.organization?.message} {...register("organization")} />
        <TextInput
          label="Password *"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          hint="Use a strong, unique password. Don’t reuse your institutional email password."
          error={errors.password?.message}
          {...register("password")}
        />
        <TextInput label="Confirm password *" type="password" placeholder="Confirm password *" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Checkbox
          label={
            <span className="text-body-sm">
              I agree to the{" "}
              <Link href="/terms-and-conditions" className="underline underline-offset-4 hover:text-navy">
                Terms &amp; Conditions
              </Link>{" "}
              and have read the{" "}
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
          <p role="alert" className="rounded-input bg-danger-soft px-4 py-3 text-body-sm font-semibold text-danger">
            {formError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <div className="mt-6 border-t border-line pt-6">
        <p className="text-body-sm text-muted">Already have an account?</p>
        <ButtonLink href="/login" variant="secondary" className="mt-4 w-full">
          Login
        </ButtonLink>
      </div>
    </Card>
  );
}
