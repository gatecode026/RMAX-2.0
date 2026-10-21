import type { Metadata } from "next";
import { AuthShell } from "@/components/sections/AuthShell";
import { RegisterForm } from "@/components/sections/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function CreateAccountPage() {
  return (
    <AuthShell
      title="Your institution. Your account."
      lead="Keep your RMAX profile, delivery addresses and orders in one place. An account is optional — you can also checkout as a guest."
    >
      <RegisterForm />
    </AuthShell>
  );
}
