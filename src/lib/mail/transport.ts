import "server-only";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { format } from "node:util";
import type { MailConfig } from "@/lib/mail/config";

/**
 * The single SMTP sender for every email RMAX sends (business notifications and password-reset
 * emails). Port 587 with STARTTLS: `secure: false` plus `requireTLS: true` means the session is
 * never allowed to continue in plain text. The credentials only ever come from server-only env vars.
 *
 * It also reports whether the SMTP DATA command was issued, which is what separates "failed before
 * anything was transmitted" (safe to retry) from "connection dropped while the message was in
 * flight" (may have been delivered).
 */
export function createSender(cfg: MailConfig) {
  const state = { dataIssued: false };
  const watch = (entry: { tnx?: string } | undefined, message: unknown, ...args: unknown[]) => {
    if (entry?.tnx === "client" && /^DATA\b/.test(format(String(message), ...args))) state.dataIssued = true;
  };
  const noop = () => undefined;
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    requireTLS: cfg.requireTLS,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 25_000,
    debug: true,
    logger: { level: noop, trace: noop, debug: watch, info: watch, warn: noop, error: noop, fatal: noop },
  } as SMTPTransport.Options);
  return { transporter, state };
}

/** Error text that is safe to store or log: codes only, never addresses, OTPs or credentials. */
export function safeMailError(err: unknown): string {
  const e = err as { code?: string; responseCode?: number; command?: string } | undefined;
  const parts = [e?.code, e?.responseCode && "smtp " + e.responseCode, e?.command && "during " + e.command].filter(Boolean);
  return (parts.join(" ") || "unknown error").slice(0, 160);
}
