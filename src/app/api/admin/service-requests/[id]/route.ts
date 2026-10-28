import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ServiceRequest } from "@/models/ServiceRequest";
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

    const ticket = await ServiceRequest.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    await logAction({
      actor: user,
      action: "order_status_updated",
      entityType: "order",
      entityId: id,
      details: `Updated service ticket ${ticket.ticketId} status to ${body.status || ticket.status}`,
    });

    return NextResponse.json({ success: true, request: ticket });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update service ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "super_admin" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Only Super Admin can delete service tickets" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const ticket = await ServiceRequest.findByIdAndDelete(id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    await logAction({
      actor: user,
      action: "user_deleted",
      entityType: "order",
      entityId: id,
      details: `Deleted service ticket ${ticket.ticketId}`,
    });

    return NextResponse.json({ success: true, message: "Ticket deleted" });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
