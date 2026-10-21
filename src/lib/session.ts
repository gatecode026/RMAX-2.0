import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";

/** Verified user id from the Auth.js session, or null for guests. */
export async function getSessionUserId(): Promise<string | null> {
  await connection(); // session validation reads the clock → request-time only
  const session = await auth();
  return session?.user?.id ?? null;
}

/** For account pages: redirect to /login when not signed in. */
export async function requireUserId(next?: string): Promise<string> {
  const id = await getSessionUserId();
  if (!id) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return id;
}
