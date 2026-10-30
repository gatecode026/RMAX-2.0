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

import { useToast } from "@/components/ui/Toast";

type Props = { initial: { name: string; organization: string; email: string; phone: string } };

export function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const { success, error } = useToast();
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
    const res = await requestJson("/api/account/profile", "PATCH", values);
    if (res.ok) {
      success("Profile Updated", "Your contact details and mobile number have been saved successfully.");
      router.refresh();
      return;
    }
    applyFieldErrors(setError, res.fields);
    setFormError(res.message);
    error("Update Failed", res.message || "Failed to update profile");
  }

  return (
    <Card id="profile" className="scroll-mt-28 p-7">
      <h2 className="text-title">Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 flex flex-col gap-5">
        <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
          <TextInput label="Full name *" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <TextInput label="Organization" autoComplete="organization" error={errors.organization?.message} {...register("organization")} />
          <TextInput label="Email" type="email" value={initial.email} readOnly disabled hint="Email changes are not available." />
          <TextInput label="Mobile Number *" type="tel" placeholder="10-digit mobile number" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
        </div>
        {formError && (
          <p role="alert" className="rounded-input bg-danger-soft px-4 py-3 text-body-sm font-semibold text-danger">
            {formError}
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
  const { success, error } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordInput) {
    setFormError(null);
    if (values.currentPassword === values.newPassword) {
      const msg = "New password cannot be the same as your current password.";
      setError("newPassword", { type: "manual", message: msg });
      setFormError(msg);
      error("Password Error", msg);
      return;
    }
    const res = await requestJson("/api/account/password", "POST", values);
    if (res.ok) {
      reset();
      success("Password Changed", "Your account password has been updated securely.");
      setTimeout(onDone, 1200);
      return;
    }
    applyFieldErrors(setError, res.fields);
    setFormError(res.message);
    error("Password Change Failed", res.message || "Failed to update password");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-5 border-t border-line pt-6" aria-label="Change password">
      <h3 className="text-[20px]/7">Change password</h3>
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-3">
        <TextInput label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register("currentPassword")} />
        <TextInput label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register("newPassword")} />
        <TextInput label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      </div>
      {formError && (
        <p role="alert" className="rounded-input bg-danger-soft px-4 py-3 text-body-sm font-semibold text-danger">
          {formError}
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
