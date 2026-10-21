import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { fail, ok, readJson, zodFail, route } from "@/lib/api";
import { addressesUpdateSchema } from "@/lib/validations/schemas";
import { getSessionUserId } from "@/lib/session";

export const PATCH = route(async (req: Request) => {
  const userId = await getSessionUserId();
  if (!userId) return fail("Please log in.", 401);
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = addressesUpdateSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  const update: Record<string, unknown> = {};
  if (parsed.data.shippingAddress) update.shippingAddress = parsed.data.shippingAddress;
  if (parsed.data.billingSameAsShipping !== undefined) update.billingSameAsShipping = parsed.data.billingSameAsShipping;
  if (parsed.data.billingAddress) update.billingAddress = parsed.data.billingAddress;

  await connectDB();
  const user = await User.findByIdAndUpdate(userId, update, { returnDocument: "after" }).lean();
  if (!user) return fail("Account not found.", 404);
  return ok({ saved: true });
});
