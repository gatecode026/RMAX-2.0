import bcrypt from "bcryptjs";
import { connectDB, isDatabaseUnavailable } from "@/lib/mongodb";
import { User } from "@/models/User";
import { fail, isDuplicateKey, limited, ok, readJson, zodFail, route } from "@/lib/api";
import { registerSchema } from "@/lib/validations/schemas";

export const POST = route(async (req: Request) => {
  const rl = limited(req, "register", 5, 60 * 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = registerSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);
  const { name, email, phone, organization, password } = parsed.data;

  try {
    await connectDB();
    // 10 rounds of bcrypt is OWASP compliant, cryptographically secure and 4x faster than 12
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name, email, phone, organization, passwordHash });
    return ok({ email }, 201);
  } catch (err) {
    if (isDuplicateKey(err)) {
      return fail("An account with this email already exists.", 409, {
        email: "An account with this email already exists.",
      });
    }
    if (isDatabaseUnavailable(err)) throw err;
    return fail("We could not create your account. Please try again.", 500);
  }
});
