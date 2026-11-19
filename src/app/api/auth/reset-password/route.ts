import bcrypt from "bcryptjs";
import type { Types } from "mongoose";
import { connectDB, isDatabaseUnavailable } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetOtp } from "@/models/PasswordResetOtp";
import { rateLimitShared } from "@/lib/rate-limit";
import { fail, limited, ok, readJson, zodFail, route } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validations/schemas";
import { OTP_MAX_ATTEMPTS, otpMatches } from "@/lib/auth/otp";

const INVALID = "That code is invalid or has expired. Please request a new one.";

/**
 * Completes a reset: checks the emailed code and sets the new password.
 *  - each guess consumes an attempt atomically (max 5 per code), so parallel guessing cannot exceed the cap;
 *  - a code works once (claimed atomically) and only before it expires;
 *  - the account's sessions are signed out (tokenVersion) and any lockout is cleared;
 *  - every failure gives the same message, so nothing reveals which part was wrong.
 */
export const POST = route(async (req: Request) => {
  const rl = await limited(req, "reset", 20, 60 * 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = resetPasswordSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);
  const { email, otp, password } = parsed.data;
  // Per-address cap on verification attempts across all IPs (each code is also capped at 5 guesses).
  if (!(await rateLimitShared(`reset-email:${email}`, 30, 60 * 60_000)).allowed) {
    return fail("Too many attempts. Please try again later.", 429);
  }

  try {
    await connectDB();
    const now = new Date();
    const live = await PasswordResetOtp.find({ email, usedAt: null, expiresAt: { $gt: now }, attempts: { $lt: OTP_MAX_ATTEMPTS } }).select("_id").lean();

    let matched: { _id: unknown; user: Types.ObjectId } | null = null;
    for (const { _id } of live) {
      // Spend an attempt first; only a record that still had attempts left can be compared.
      const rec = await PasswordResetOtp.findOneAndUpdate(
        { _id, usedAt: null, expiresAt: { $gt: now }, attempts: { $lt: OTP_MAX_ATTEMPTS } },
        { $inc: { attempts: 1 } },
        { returnDocument: "after" },
      ).lean();
      if (rec && otpMatches(String(rec.user), otp, rec.codeHash)) {
        matched = rec;
        break;
      }
    }
    if (!matched) return fail(INVALID, 400, { otp: INVALID });

    // Single use: only the request that flips usedAt proceeds.
    const claimed = await PasswordResetOtp.findOneAndUpdate({ _id: matched._id, usedAt: null }, { $set: { usedAt: new Date() } });
    if (!claimed) return fail(INVALID, 400, { otp: INVALID });

    const passwordHash = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: matched.user },
      { $set: { passwordHash, failedLoginAttempts: 0, lockedUntil: null }, $inc: { tokenVersion: 1 } },
    );
    await PasswordResetOtp.deleteMany({ user: matched.user });
    return ok({ reset: true });
  } catch (err) {
    if (isDatabaseUnavailable(err)) throw err;
    return fail("We could not reset your password. Please try again.", 500);
  }
});
