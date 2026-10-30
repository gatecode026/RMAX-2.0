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

    // 1. Check if a CUSTOMER account already exists with this email. Scoped to the customer
    // identity namespace only — the same email may already belong to an Admin or Manager
    // account; that's allowed by design (same person, independent identities with their own
    // passwords), so it must never block customer registration.
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim(), role: "customer" }).lean();
    if (existingEmail) {
      return fail("An account with this email already exists.", 409, {
        email: "An account with this email already exists. Please log in.",
      });
    }

    // 2. Check if a CUSTOMER account already exists with this mobile number (same scoping).
    if (phone) {
      const cleanDigits = phone.replace(/\D/g, "").slice(-10);
      const existingPhone = await User.findOne({
        role: "customer",
        $or: [
          { phone: cleanDigits },
          { phone },
          { phone: `+91${cleanDigits}` },
          { phone: `0${cleanDigits}` },
        ],
      }).lean();

      if (existingPhone) {
        return fail("An account with this mobile number already exists.", 409, {
          phone: "An account with this mobile number already exists. Please log in or use a different number.",
        });
      }
    }

    // 10 rounds of bcrypt is OWASP compliant, cryptographically secure and 4x faster than 12
    const passwordHash = await bcrypt.hash(password, 10);
    const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : undefined;
    await User.create({ name, email: email.toLowerCase().trim(), phone: cleanPhone, organization, passwordHash });
    return ok({ email }, 201);
  } catch (err: unknown) {
    if (isDuplicateKey(err)) {
      const errMsg = (err as Error)?.message || "";
      if (errMsg.includes("phone") || (err as { keyPattern?: { phone?: number } })?.keyPattern?.phone) {
        return fail("An account with this mobile number already exists.", 409, {
          phone: "An account with this mobile number already exists. Please log in or use a different number.",
        });
      }
      return fail("An account with this email already exists.", 409, {
        email: "An account with this email already exists.",
      });
    }
    if (isDatabaseUnavailable(err)) throw err;
    return fail("We could not create your account. Please try again.", 500);
  }
});
