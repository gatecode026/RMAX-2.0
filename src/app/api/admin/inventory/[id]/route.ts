import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getSessionUser } from "@/lib/session";
import { logAction } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSessionUser("staff");
    if (!user || (user.role !== "super_admin" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Only Super Admin can update inventory" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const stock = Number(body.stock ?? body.inStock);

    if (isNaN(stock) || stock < 0) {
      return NextResponse.json({ success: false, error: "Valid stock count is required" }, { status: 400 });
    }

    await connectDB();
    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: { stock } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    await logAction({
      actor: user,
      action: "order_status_updated",
      entityType: "order",
      entityId: id,
      details: `Updated stock level of ${updated.name} to ${stock} units`,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update stock" },
      { status: 500 }
    );
  }
}
