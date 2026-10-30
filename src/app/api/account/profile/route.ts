import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { fail, isDuplicateKey, ok, readJson, zodFail, route } from "@/lib/api";
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

  // Check if phone number is already registered by another CUSTOMER account. Scoped to the
  // customer identity namespace only — an Admin or Manager account may legitimately share a
  // phone number with this customer (same person, independent identities).
  if (phone) {
    const cleanDigits = phone.replace(/\D/g, "").slice(-10);
    const existing = await User.findOne({
      _id: { $ne: userId },
      role: "customer",
      $or: [
        { phone: cleanDigits },
        { phone },
        { phone: `+91${cleanDigits}` },
        { phone: `0${cleanDigits}` },
      ],
    }).lean();

    if (existing) {
      return fail("This mobile number is already in use by another account.", 409, {
        phone: "This mobile number is already in use by another account.",
      });
    }
  }

  try {
    const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";
    const user = await User.findByIdAndUpdate(
      userId,
      { name, organization: organization ?? "", phone: cleanPhone },
      { returnDocument: "after" },
    ).lean();
    if (!user) return fail("Account not found.", 404);
    return ok({ name: user.name, organization: user.organization, phone: user.phone });
  } catch (err: unknown) {
    if (isDuplicateKey(err)) {
      return fail("This mobile number is already in use by another account.", 409, {
        phone: "This mobile number is already in use by another account.",
      });
    }
    return fail("Failed to update profile.", 500);
  }
});
