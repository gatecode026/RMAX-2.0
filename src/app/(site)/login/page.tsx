import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/sections/AuthShell";
import { LoginForm } from "@/components/sections/LoginForm";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back."
      lead="Sign in to see your orders, manage institutional delivery details and get support for your RMAX products."
    >
      <Suspense fallback={<div className="h-[660px] animate-pulse rounded-card bg-soft/70" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
