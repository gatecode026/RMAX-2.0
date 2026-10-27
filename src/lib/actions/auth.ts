"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { DB_UNAVAILABLE_MESSAGE } from "@/lib/api";
import { loginSchema, type LoginInput } from "@/lib/validations/schemas";

import { User } from "@/models/User";

export type ActionResult = { ok: true; role?: string } | { ok: false; message: string };

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Enter a valid email and password." };
  try {
    await connectDB();
  } catch {
    return { ok: false, message: DB_UNAVAILABLE_MESSAGE };
  }
  try {
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirect: false });
    const user = await User.findOne({ email: parsed.data.email.toLowerCase().trim() }).select("role");
    return { ok: true, role: user?.role || "customer" };
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, message: "Incorrect email or password." };
    throw err;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
