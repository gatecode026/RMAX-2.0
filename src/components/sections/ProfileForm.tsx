"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/Field";
import { applyFieldErrors, requestJson } from "@/lib/client-api";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordInput,
  type ProfileInput,
} from "@/lib/validations/schemas";

type Props = { initial: { name: string; organization: string; email: string; phone: string } };

export function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: initial.name, organization: initial.organization, phone: initial.phone },
  });

  async function onSubmit(values: ProfileInput) {
    setFormError(null);
    setSaved(false);
    const res = await requestJson("/api/account/profile", "PATCH", values);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      return;
    }
    applyFieldErrors(setError, res.fields);
    setFormError(res.message);
  }

  return (
    <Card id="profile" className="scroll-mt-28 p-7">
      <h2 className="text-title">Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 flex flex-col gap-5">
        <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
          <TextInput label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <TextInput label="Organization" autoComplete="organization" error={errors.organization?.message} {...register("organization")} />
          <TextInput label="Email" type="email" value={initial.email} readOnly disabled hint="Email changes are not available." />
          <TextInput label="Phone" type="tel" placeholder="Add a contact number" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
        </div>
        {formError && (
          <p role="alert" className="rounded-input bg-danger-soft px-4 py-3 text-body-sm font-semibold text-danger">
            {formError}
          </p>
        )}
        {saved && (
          <p role="status" className="rounded-input bg-success-soft px-4 py-3 text-body-sm font-semibold text-success">
            Profile saved.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save profile"}
          </Button>
          <Button type="button" variant="secondary" size="sm" aria-expanded={showPassword} onClick={() => setShowPassword((v) => !v)}>
            Change password
          </Button>
        </div>
      </form>
      {showPassword && <ChangePassword onDone={() => setShowPassword(false)} />}
    </Card>
  );
}

// ASSUMED: the design shows a "Change password" button but no panel — a minimal inline form in the same style.
function ChangePassword({ onDone }: { onDone: () => void }) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordInput) {
    setMessage(null);
    const res = await requestJson("/api/account/password", "POST", values);
    if (res.ok) {
      reset();
      setMessage({ ok: true, text: "Password changed." });
      setTimeout(onDone, 1500);
      return;
    }
    applyFieldErrors(setError, res.fields);
    setMessage({ ok: false, text: res.message });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-5 border-t border-line pt-6" aria-label="Change password">
      <h3 className="text-[20px]/7">Change password</h3>
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-3">
        <TextInput label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register("currentPassword")} />
        <TextInput label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register("newPassword")} />
        <TextInput label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      </div>
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`rounded-input px-4 py-3 text-body-sm font-semibold ${message.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}
        >
          {message.text}
        </p>
      )}
      <div>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
