import { NextResponse } from "next/server";
import { getAdminDashboardOverview } from "@/lib/admin/data";
import { checkApiRole } from "@/lib/session";

export async function GET() {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const data = await getAdminDashboardOverview();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : "Failed to load dashboard overview" } },
      { status: 500 }
    );
  }
}
