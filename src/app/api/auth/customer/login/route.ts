import { connectDB } from "@/lib/mongodb";
import { fail, limited, ok, readJson, zodFail, route, DB_UNAVAILABLE_MESSAGE } from "@/lib/api";
import { loginSchema } from "@/lib/validations/schemas";
import { resolveCustomerLogin } from "@/lib/auth/resolve";
import { createSession } from "@/lib/session";

/** POST /api/auth/customer/login — Customer portal only; never matches an Admin/Manager account. */
export const POST = route(async (req: Request) => {
  const rl = limited(req, "login-customer", 10, 15 * 60_000);
  if (rl) return rl;

  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = loginSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  try {
    await connectDB();
  } catch {
    return fail(DB_UNAVAILABLE_MESSAGE, 503);
  }

  const result = await resolveCustomerLogin(parsed.data.email, parsed.data.password);
  if (!result.ok) return fail(result.message, 401);

  const user = await createSession(result.account);
  return ok({ id: user.id, name: user.name, email: user.email, role: user.role, redirectTo: "/account" });
});
