import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ServiceRequest } from "@/models/ServiceRequest";
import { getSessionUser } from "@/lib/session";
import { logAction } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const user = await getSessionUser("staff");
    if (!user || (user.role !== "super_admin" && user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const requests = await ServiceRequest.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, requests });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load service requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser("staff");
    if (!user || (user.role !== "super_admin" && user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { institution, location, serviceType, model, priority, scheduledDate, technician, contactPerson, phone, notes } = body;

    if (!institution || !location) {
      return NextResponse.json({ success: false, error: "Institution and location are required" }, { status: 400 });
    }

    await connectDB();

    const count = await ServiceRequest.countDocuments();
    const ticketId = `SR-2026-${String(count + 1).padStart(3, "0")}`;

    const newTicket = await ServiceRequest.create({
      ticketId,
      institution,
      location,
      serviceType: serviceType || "Installation",
      model: model || "Pro-Max",
      status: "Scheduled",
      priority: priority || "Medium",
      scheduledDate: scheduledDate || new Date().toLocaleDateString("en-GB"),
      technician: technician || "Assigned Engineer",
      contactPerson: contactPerson || "",
      phone: phone || "",
      notes: notes || "",
    });

    await logAction({
      actor: user,
      action: "order_status_updated",
      entityType: "order",
      entityId: String(newTicket._id),
      details: `Created service ticket ${ticketId} for ${institution}`,
    });

    await createNotification({
      title: "New Service Ticket Logged",
      message: `Ticket ${ticketId} created for ${institution} (${serviceType})`,
      type: "system",
      link: "/admin/service-requests",
    });

    return NextResponse.json({ success: true, request: newTicket }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to create service request" },
      { status: 500 }
    );
  }
}
