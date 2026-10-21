"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox, TextInput } from "@/components/ui/Field";
import { loginAction } from "@/lib/actions/auth";
import { safeNext } from "@/lib/safe-next";
import { loginSchema, type LoginInput } from "@/lib/validations/schemas";

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const res = await loginAction(values);
    if (!res.ok) return setFormError(res.message);
    router.push(next);
    router.refresh();
  }

  return (
    <Card className="p-7 md:p-7">
      <h2 className="text-[28px]/9">Login to your account</h2>
      <p className="mt-4 text-body-sm text-muted">Enter the email and password you used to create your account.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 flex flex-col gap-5">
        <TextInput label="Email address *" type="email" placeholder="Email address *" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <TextInput label="Password *" type="password" placeholder="Enter your password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        <Checkbox label={<span className="text-body-sm">Remember me</span>} {...register("remember")} />
        <Link href="/forgot-password" className="w-fit text-body-sm font-semibold text-navy underline-offset-4 hover:underline">
          Forgot password?
        </Link>
        {formError && (
          <p role="alert" className="rounded-input bg-danger-soft px-4 py-3 text-body-sm font-semibold text-danger">
            {formError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Login"}
        </Button>
      </form>
      <div className="mt-6 border-t border-line pt-6">
        <p className="text-body-sm text-muted">New to RMAX Solutions?</p>
        <ButtonLink href="/create-account" variant="secondary" className="mt-4 w-full">
          Create account
        </ButtonLink>
        <p className="mt-5 text-body-sm text-muted">Just placing an order? Guest checkout is available.</p>
      </div>
    </Card>
  );
}
