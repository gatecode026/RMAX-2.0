import { NextResponse } from "next/server";
import { checkApiRole } from "@/lib/session";
import { getManagerPermissions } from "@/lib/permissions-server";

/** GET /api/manager/permissions — the signed-in manager's current permissions (read fresh every call). */
export async function GET() {
  const auth = await checkApiRole(["manager"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return NextResponse.json({ success: true, permissions: await getManagerPermissions(auth.user.id) });
}
