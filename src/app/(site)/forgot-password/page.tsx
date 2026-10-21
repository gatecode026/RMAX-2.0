import type { Metadata } from "next";
import { AuthShell } from "@/components/sections/AuthShell";
import { ForgotPasswordForm } from "@/components/sections/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Let’s get you back in."
      lead="Enter the email associated with your RMAX account to request a password reset. Your existing order information stays with your account."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
