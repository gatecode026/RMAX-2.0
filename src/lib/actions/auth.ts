"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { DB_UNAVAILABLE_MESSAGE } from "@/lib/api";
import { loginSchema, type LoginInput } from "@/lib/validations/schemas";

import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import { rateLimit } from "@/lib/rate-limit";

export type ActionResult = { ok: true; role?: string } | { ok: false; message: string };

export type LoginActionOptions = {
  portal?: "customer" | "admin";
};

export async function loginAction(
  input: LoginInput,
  options?: LoginActionOptions
): Promise<ActionResult> {
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

  // Throttle brute force attempts
  if (!rateLimit(`login:${email}`, 10, 15 * 60 * 1000).allowed) {
    return { ok: false, message: "Too many login attempts. Please try again in 15 minutes." };
  }

  // 1. Verify user exists
  const user = await User.findOne({ email }).select("+passwordHash role status name").lean();
  if (!user) {
    return {
      ok: false,
      message:
        portal === "admin"
          ? "No administrative staff account found with this email."
          : "User not found or invalid credentials.",
    };
  }

  // 2. Verify account is active
  if (user.status === "inactive") {
    return {
      ok: false,
      message: "Your account is currently inactive. Please contact support.",
    };
  }

  const role = user.role || "customer";
  const isStaff = role === "manager" || role === "super_admin" || role === "admin";

  // 3. Prevent managers/admins from logging in through customer login
  if (portal === "customer" && isStaff) {
    return {
      ok: false,
      message: "User not found or invalid credentials.",
    };
  }

  // 4. Prevent customers from logging in through admin portal
  if (portal === "admin" && !isStaff) {
    return {
      ok: false,
      message: "Access denied. Only authorized managers and administrative staff can sign in here.",
    };
  }

  // 5. Verify password hash exists and matches
  if (!user.passwordHash) {
    return {
      ok: false,
      message:
        portal === "customer"
          ? "User not found or invalid credentials."
          : "This account has no password configured. Please use password recovery.",
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return {
      ok: false,
      message:
        portal === "customer"
          ? "User not found or invalid credentials."
          : "Incorrect password. Please verify your credentials or use Forgot Password.",
    };
  }

  // 6. Sign in with NextAuth to issue the session cookie
  try {
    await signIn("credentials", { email, password, preVerified: "true", redirect: false });
    return { ok: true, role };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, message: "Session could not be established. Please try again." };
    }
    throw err;
  }
}

export async function logoutAction(redirectTo?: string | FormData) {
  const target = typeof redirectTo === "string" ? redirectTo : "/";
  await signOut({ redirectTo: target });
}
