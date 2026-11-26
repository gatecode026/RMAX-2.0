import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/enums";

/** Orders are addressed by Mongo id or by reference (RMAX-DEMO-001). */
const filterFor = (id: string) => (/^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { reference: id });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkApiRole(["super_admin", "admin"]);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await connectDB();
    const order = await Order.findOne(filterFor((await params).id)).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

/** Move an order along confirmed → preparing → dispatched → delivered; the tracking timeline follows. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkApiRole(["super_admin", "admin"]);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await connectDB();
    const { status } = (await req.json()) as { status?: string };
    if (!status || !(ORDER_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }
    const order = await Order.findOne(filterFor((await params).id));
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const before = order.status;
    const idx = ORDER_STATUSES.indexOf(status as OrderStatus);
    const now = new Date();
    // Steps up to the new status are done (keep an existing time); later steps are pending again.
    order.timeline = ORDER_STATUSES.map((step, i) => ({ step, at: i <= idx ? order.timeline.find((t) => t.step === step)?.at ?? now : undefined })) as typeof order.timeline;
    order.status = status as OrderStatus;
    await order.save();

    await logAuditEvent({
      actor: auth.user, action: "order.status_changed", entityType: "order", entityId: String(order._id),
      details: `Order ${order.reference}: ${before} → ${status}`,
    });
    return NextResponse.json({ order: order.toObject() });
  } catch (err) {
    console.error("PATCH /api/admin/orders/[id] error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
