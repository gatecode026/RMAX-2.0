import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProductCategory } from "@/models/ProductCategory";
import { Product } from "@/models/Product";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  const { user } = authResult;
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();
    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.description !== undefined) update.description = body.description;
    if (body.image !== undefined) update.image = body.image;
    if (body.sortOrder !== undefined) update.sortOrder = Number(body.sortOrder);
    if (body.active !== undefined) update.active = Boolean(body.active);

    const updated = await ProductCategory.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    await logAuditEvent({
      actor: user,
      action: "PRODUCT_CATEGORY_UPDATED",
      entityType: "product_category",
      entityId: id,
      metadata: { name: updated.name, changes: update },
    });
    return NextResponse.json({ success: true, category: updated });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  const { user } = authResult;
  try {
    const { id } = await params;
    await connectDB();
    const inUse = await Product.exists({ categoryId: id });
    if (inUse) {
      return NextResponse.json({ error: "This category is assigned to one or more products — reassign them first." }, { status: 409 });
    }
    const deleted = await ProductCategory.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    await logAuditEvent({
      actor: user,
      action: "PRODUCT_CATEGORY_DELETED",
      entityType: "product_category",
      entityId: id,
      metadata: { name: deleted.name },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete category" }, { status: 500 });
  }
}
