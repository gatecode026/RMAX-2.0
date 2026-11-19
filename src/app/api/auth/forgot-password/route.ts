import { after } from "next/server";
import { connectDB, isDatabaseUnavailable } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetOtp } from "@/models/PasswordResetOtp";
import { rateLimitShared } from "@/lib/rate-limit";
import { fail, limited, ok, readJson, zodFail, route } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validations/schemas";
import { OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS, generateOtp, hashOtp } from "@/lib/auth/otp";
import { sendPasswordResetOtp } from "@/lib/mail/otp";

const ROLE_LABEL: Record<string, string> = { super_admin: "Admin", admin: "Admin", manager: "Manager", customer: "Customer" };

/**
 * Starts a password reset: emails a 6-digit code to the account's registered address.
 * Always answers with the same payload so account existence is never revealed. Controls:
 * 10-minute expiry, 60-second resend cooldown per account, one live code per account (a new
 * code replaces the old one), and an IP rate limit. The code is only ever in the email.
 *
 * The same email may own an Admin, Manager and Customer identity (see lib/auth/resolve.ts);
 * each gets its own code, labelled with the account type.
 */
export const POST = route(async (req: Request) => {
  const rl = await limited(req, "forgot", 8, 60 * 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = forgotPasswordSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  // Per-address cap too, so many IPs cannot flood one inbox with codes. Same answer as success (no account hints).
  if (!(await rateLimitShared(`forgot-email:${parsed.data.email}`, 6, 60 * 60_000)).allowed) {
    return ok({ email: parsed.data.email, resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 });
  }

  const toSend: { to: string; code: string; label: string }[] = [];
  try {
    await connectDB();
    const accounts = await User.find({ email: parsed.data.email, status: { $ne: "inactive" } }).select("_id role email").lean();
    for (const account of accounts) {
      const latest = await PasswordResetOtp.findOne({ user: account._id }).sort({ lastSentAt: -1 }).lean();
      if (latest && Date.now() - latest.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) continue; // cooldown: silently keep the current code
      const code = generateOtp();
      await PasswordResetOtp.deleteMany({ user: account._id });
      await PasswordResetOtp.create({
        user: account._id,
        email: parsed.data.email,
        codeHash: hashOtp(String(account._id), code),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        attempts: 0,
        lastSentAt: new Date(),
      });
      toSend.push({ to: account.email, code, label: ROLE_LABEL[account.role] ?? "RMAX" });
    }
  } catch (err) {
    if (isDatabaseUnavailable(err)) throw err;
    return fail("We could not process your request. Please try again.", 500);
  }

  // Sent after the response so response time does not reveal whether an account exists.
  const send = async () => {
    for (const m of toSend) await sendPasswordResetOtp(m.to, m.code, m.label, OTP_TTL_MS / 60_000);
  };
  try {
    after(send);
  } catch {
    void send();
  }
  return ok({ email: parsed.data.email, resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 });
});
