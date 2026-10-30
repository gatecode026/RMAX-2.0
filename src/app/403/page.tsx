import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = { title: "Access denied" };

/**
 * Reached when a visitor is authenticated, but as the wrong portal identity for the page they
 * requested — e.g. a Manager session hitting /admin/dashboard, or an Admin session hitting
 * /manager/dashboard. Each portal requires its own session; one never substitutes for another.
 */
export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-16">
      <div className="w-full max-w-md rounded-card border border-line bg-card p-8 text-center shadow-card">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <ShieldAlert className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 font-heading text-title font-extrabold text-charcoal">Access denied</h1>
        <p className="mt-2 text-body text-muted">
          You're signed in, but not with the identity this area requires. Sign in with the correct account to
          continue.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href="/admin/login"
            className="inline-flex h-11 items-center justify-center rounded-action bg-linear-to-r from-navy to-navy-600 px-6 text-body font-bold text-white transition hover:brightness-110"
          >
            Staff sign in
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-action border border-line bg-card px-6 text-body font-bold text-navy transition hover:border-navy hover:bg-soft"
          >
            Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
