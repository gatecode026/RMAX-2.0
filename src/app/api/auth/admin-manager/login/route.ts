import { connectDB } from "@/lib/mongodb";
import { fail, limited, ok, readJson, zodFail, route, DB_UNAVAILABLE_MESSAGE } from "@/lib/api";
import { loginSchema } from "@/lib/validations/schemas";
import { resolveStaffLogin } from "@/lib/auth/resolve";
import { createSession, roleToTier } from "@/lib/session";

/**
 * POST /api/auth/admin-manager/login — shared staff portal login. The password alone decides
 * which role authenticates and therefore which dashboard the caller is sent to; the request
 * never specifies a role. Supports the same email holding one Admin and one Manager identity,
 * each with its own independent password.
 */
export const POST = route(async (req: Request) => {
  const rl = limited(req, "login-staff", 10, 15 * 60_000);
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

  const result = await resolveStaffLogin(parsed.data.email, parsed.data.password);
  if (!result.ok) return fail(result.message, 401);

  const user = await createSession(result.account);
  const tier = roleToTier(user.role);
  return ok({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    redirectTo: tier === "manager" ? "/manager/dashboard" : "/admin/dashboard",
  });
});
