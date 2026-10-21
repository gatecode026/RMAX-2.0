import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { fail, ok, readJson, zodFail, route } from "@/lib/api";
import { profileSchema } from "@/lib/validations/schemas";
import { getSessionUserId } from "@/lib/session";

export const PATCH = route(async (req: Request) => {
  const userId = await getSessionUserId();
  if (!userId) return fail("Please log in.", 401);
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = profileSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  await connectDB();
  const { name, organization, phone } = parsed.data;
  const user = await User.findByIdAndUpdate(
    userId,
    { name, organization: organization ?? "", phone: phone ?? "" },
    { returnDocument: "after" },
  ).lean();
  if (!user) return fail("Account not found.", 404);
  return ok({ name: user.name, organization: user.organization, phone: user.phone });
});
