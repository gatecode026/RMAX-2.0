import "server-only";
import { getMailConfig } from "@/lib/mail/config";
import { createSender, safeMailError } from "@/lib/mail/transport";
import { renderOtpEmail } from "@/lib/mail/templates";

/**
 * Sends a password-reset code to the account's registered address, through the same sender as the
 * business notifications. The code is rendered into this one message only: it is not queued, not
 * stored in any job payload, and never logged. A failure is logged as an error code and the user
 * can simply request another code.
 */
export async function sendPasswordResetOtp(to: string, code: string, accountLabel: string, ttlMinutes: number): Promise<boolean> {
  const cfg = getMailConfig();
  if (!cfg) {
    console.warn("[mail] password reset: SMTP not configured — code not sent");
    return false;
  }
  const mail = renderOtpEmail({ code, accountLabel, ttlMinutes });
  try {
    await createSender(cfg).transporter.sendMail({ from: cfg.from, to, replyTo: cfg.replyTo, subject: mail.subject, html: mail.html, text: mail.text });
    return true;
  } catch (err) {
    console.warn(`[mail] password reset email failed: ${safeMailError(err)}`);
    return false;
  }
}
