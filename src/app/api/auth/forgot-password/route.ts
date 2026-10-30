import { createHash, randomBytes } from "node:crypto";
import { connectDB, isDatabaseUnavailable } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { fail, limited, ok, readJson, zodFail, route } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validations/schemas";

/**
 * Always answers with the same success payload so account existence is never revealed.
 * No email provider is configured (none is shown in the design), so the request is
 * persisted and, in development only, the reset token is logged.
 */
export const POST = route(async (req: Request) => {
  const rl = limited(req, "forgot", 5, 60 * 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = forgotPasswordSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  try {
    await connectDB();
    // The same email may own an Admin, a Manager AND a Customer identity at once (see
    // lib/auth/resolve.ts). An email-only reset must never silently pick just one of them —
    // each identity gets its own independent token, scoped to that one account only.
    const accounts = await User.find({ email: parsed.data.email }).select("_id role").lean();
    for (const account of accounts) {
      const token = randomBytes(32).toString("hex");
      await PasswordResetToken.create({
        user: account._id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
      if (process.env.NODE_ENV !== "production") {
        console.info(`[forgot-password] reset token for ${parsed.data.email} (${account.role}): ${token}`);
      }
    }
  } catch (err) {
    if (isDatabaseUnavailable(err)) throw err;
    return fail("We could not process your request. Please try again.", 500);
  }
  return ok({ email: parsed.data.email });
});
