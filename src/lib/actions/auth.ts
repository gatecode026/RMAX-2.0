"use server";

import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { DB_UNAVAILABLE_MESSAGE } from "@/lib/api";
import { loginSchema, type LoginInput } from "@/lib/validations/schemas";
import { resolveCustomerLogin, resolveStaffLogin } from "@/lib/auth/resolve";
import { createSession, destroySession } from "@/lib/session";

export type ActionResult = { ok: true; role?: string } | { ok: false; message: string };

export type LoginActionOptions = {
  portal?: "customer" | "admin";
};

/**
 * Resolves credentials against the correct independent identity namespace and, on success,
 * issues that portal's own session cookie. Customer, Admin and Manager sessions never share a
 * cookie, so signing in to one never disturbs the other two.
 */
export async function loginAction(input: LoginInput, options?: LoginActionOptions): Promise<ActionResult> {
  const portal = options?.portal || "customer";

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message;
    return { ok: false, message: issue || "Enter a valid email address and password." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const password = parsed.data.password;

  try {
    await connectDB();
  } catch {
    return { ok: false, message: DB_UNAVAILABLE_MESSAGE };
  }

  const result = portal === "admin" ? await resolveStaffLogin(email, password) : await resolveCustomerLogin(email, password);

  if (!result.ok) return { ok: false, message: result.message };

  await createSession(result.account);
  return { ok: true, role: result.account.role };
}

async function performLogout(tier: "admin" | "manager" | "customer", redirectTo?: string) {
  await destroySession(tier);
  redirect(redirectTo || "/");
}

/** Bind directly as a <form action={customerLogoutAction}> — clears only the Customer session. */
export async function customerLogoutAction(_formData?: FormData) {
  await performLogout("customer", "/login");
}

export async function adminLogoutAction(redirectTo?: string) {
  await performLogout("admin", redirectTo || "/admin/login");
}

export async function managerLogoutAction(redirectTo?: string) {
  await performLogout("manager", redirectTo || "/admin/login");
}

/** @deprecated kept only so stray imports fail loudly instead of silently no-op-ing; use the tier-specific actions above. */
export async function logoutAction(_redirectTo?: string | FormData) {
  throw new Error("logoutAction is deprecated — use customerLogoutAction/adminLogoutAction/managerLogoutAction.");
}
