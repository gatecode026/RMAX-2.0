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
    const user = await User.findOne({ email: parsed.data.email }).select("_id").lean();
    if (user) {
      const token = randomBytes(32).toString("hex");
      await PasswordResetToken.create({
        user: user._id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
      if (process.env.NODE_ENV !== "production") {
        console.info(`[forgot-password] reset token for ${parsed.data.email}: ${token}`);
      }
    }
  } catch (err) {
    if (isDatabaseUnavailable(err)) throw err;
    return fail("We could not process your request. Please try again.", 500);
  }
  return ok({ email: parsed.data.email });
});
