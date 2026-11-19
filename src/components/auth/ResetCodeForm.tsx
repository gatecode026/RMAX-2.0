"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { requestJson } from "@/lib/client-api";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const field =
  "h-11 w-full rounded-input border border-line bg-card px-3.5 text-body-sm text-charcoal outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 disabled:opacity-60";

/**
 * Step 2 of a password reset, shared by the customer modal, the staff login dialog and the
 * /forgot-password page: enter the emailed 6-digit code and a new password. "Resend" is
 * rate-limited (the server enforces the same cooldown).
 */
export function ResetCodeForm({ email, resendAfterSeconds = 60, onDone }: { email: string; resendAfterSeconds?: number; onDone: () => void }) {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(resendAfterSeconds);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setFields({});
    const res = await requestJson<{ reset: true }>("/api/auth/reset-password", "POST", { email, otp, password, confirmPassword });
    setBusy(false);
    if (res.ok) return setDone(true);
    setFields(res.fields ?? {});
    setError(res.message); // the typed values stay, so the person only fixes what is wrong
  }

  async function resend() {
    if (cooldown > 0) return;
    setResent(false);
    const res = await requestJson<{ resendAfterSeconds: number }>("/api/auth/forgot-password", "POST", { email });
    if (res.ok) {
      setCooldown(res.data.resendAfterSeconds ?? 60);
      setResent(true);
      setOtp("");
    } else {
      setError(res.message);
    }
  }

  if (done) {
    return (
      <ConfirmDialog
        open
        tone="success"
        hideCancel
        title="Password updated"
        description="Your password was changed and any older sessions were signed out. Sign in with your new password."
        confirmLabel="Sign in"
        onConfirm={onDone}
        onCancel={onDone}
      />
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <p className="text-body-sm text-muted">
        If <strong className="text-charcoal">{email}</strong> is registered, we have emailed it a 6-digit code. It works once and expires in 10 minutes.
      </p>
      {error && (
        <p role="alert" className="rounded-input bg-danger-soft px-4 py-3 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="reset-otp" className="mb-1.5 block text-xs font-bold text-charcoal">
          6-digit code
        </label>
        <input
          id="reset-otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          disabled={busy}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className={`${field} text-center text-lg font-bold tracking-[0.5em]`}
        />
        {fields.otp && fields.otp !== error && <p className="mt-1 text-[11px] text-danger">{fields.otp}</p>}
      </div>
      <div>
        <label htmlFor="reset-pass" className="mb-1.5 block text-xs font-bold text-charcoal">
          New password
        </label>
        <input id="reset-pass" type="password" autoComplete="new-password" value={password} disabled={busy} onChange={(e) => setPassword(e.target.value)} className={field} />
        {fields.password && <p className="mt-1 text-[11px] text-danger">{fields.password}</p>}
      </div>
      <div>
        <label htmlFor="reset-confirm" className="mb-1.5 block text-xs font-bold text-charcoal">
          Confirm new password
        </label>
        <input id="reset-confirm" type="password" autoComplete="new-password" value={confirmPassword} disabled={busy} onChange={(e) => setConfirmPassword(e.target.value)} className={field} />
        {fields.confirmPassword && <p className="mt-1 text-[11px] text-danger">{fields.confirmPassword}</p>}
      </div>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-action bg-linear-to-r from-navy to-navy-600 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {busy ? "Updating…" : "Reset password"}
      </button>
      <p className="text-center text-xs text-muted">
        Didn&apos;t get it?{" "}
        <button type="button" onClick={resend} disabled={cooldown > 0} className="font-bold text-navy underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline">
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        {resent && <span className="ml-1 text-success">· sent again</span>}
      </p>
    </form>
  );
}
