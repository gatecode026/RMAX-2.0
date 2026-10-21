import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { fail, limited, ok, readJson, zodFail, route } from "@/lib/api";
import { changePasswordSchema } from "@/lib/validations/schemas";
import { getSessionUserId } from "@/lib/session";

export const POST = route(async (req: Request) => {
  const userId = await getSessionUserId();
  if (!userId) return fail("Please log in.", 401);
  const rl = limited(req, "password", 10, 60 * 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = changePasswordSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  await connectDB();
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) return fail("Account not found.", 404);
  if (!(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return fail("Your current password is incorrect.", 400, { currentPassword: "Your current password is incorrect." });
  }
  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();
  return ok({ changed: true });
});
