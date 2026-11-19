
/** SMTP + notification settings, read from server-only environment variables (none are NEXT_PUBLIC_, so they cannot reach the browser). Kept free of the `server-only` marker so scripts/mail-check.ts can import it. */
export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  /** STARTTLS is mandatory (SMTP_REQUIRE_TLS=false exists only for local mock servers). */
  requireTLS: boolean;
  user: string;
  pass: string;
  from: string;
  replyTo?: string;
  appUrl: string;
  adminEmails: string[];
  defaultManagerEmail?: string;
  customerLeadEmails: boolean;
  customerOrderEmails: boolean;
}

const flag = (v: string | undefined) => /^(1|true|yes|on)$/i.test((v ?? "").trim());
export const isEmail = (v: unknown): v is string => typeof v === "string" && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v.trim());

/** Required variables that are missing (empty list = configured). */
export function missingMailEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  return ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_FROM", "ADMIN_NOTIFICATION_EMAIL", "APP_URL"].filter((k) => !env[k]?.trim());
}

/** Parsed settings, or null while any required variable is missing (jobs then wait instead of failing). */
export function getMailConfig(env: NodeJS.ProcessEnv = process.env): MailConfig | null {
  if (missingMailEnv(env).length) return null;
  const adminEmails = env.ADMIN_NOTIFICATION_EMAIL!.split(/[,;]/).map((e) => e.trim()).filter(isEmail);
  if (!adminEmails.length) return null;
  const port = Number(env.SMTP_PORT);
  return {
    host: env.SMTP_HOST!.trim(),
    port,
    // 465 is implicit TLS; everything else (587) upgrades with STARTTLS. An explicit SMTP_SECURE wins.
    secure: env.SMTP_SECURE?.trim() ? flag(env.SMTP_SECURE) : port === 465,
    requireTLS: env.SMTP_REQUIRE_TLS?.trim() ? flag(env.SMTP_REQUIRE_TLS) : true,
    user: env.SMTP_USER!.trim(),
    pass: env.SMTP_PASS!,
    from: env.MAIL_FROM!.trim(),
    replyTo: env.MAIL_REPLY_TO?.trim() || undefined,
    appUrl: env.APP_URL!.trim().replace(/\/+$/, ""),
    adminEmails,
    defaultManagerEmail: isEmail(env.DEFAULT_MANAGER_NOTIFICATION_EMAIL) ? env.DEFAULT_MANAGER_NOTIFICATION_EMAIL.trim() : undefined,
    customerLeadEmails: flag(env.ENABLE_CUSTOMER_LEAD_EMAILS),
    customerOrderEmails: flag(env.ENABLE_CUSTOMER_ORDER_EMAILS),
  };
}
