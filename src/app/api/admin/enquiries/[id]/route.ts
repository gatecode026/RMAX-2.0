import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { getSessionUser } from "@/lib/session";
import { logAction } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "super_admin" && user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: { status: body.status } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    await logAction({
      actor: user,
      action: "order_status_updated",
      entityType: "order",
      entityId: id,
      details: `Updated enquiry status to ${body.status}`,
    });

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update enquiry" },
      { status: 500 }
    );
  }
}
