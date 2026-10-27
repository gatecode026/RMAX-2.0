import { NextResponse } from "next/server";
import { getAdminDashboardOverview } from "@/lib/admin/data";

export async function GET() {
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
