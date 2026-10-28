import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { revalidateTag } from "next/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const existing = await Product.findOne({ $or: [{ slug: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });

    const prevPrice = existing?.price;
    const prevStock = existing?.stock;

    const updateFields: Record<string, unknown> = {};
    if (body.title) updateFields.title = body.title;
    if (body.name) updateFields.name = body.name;
    if (body.price !== undefined) updateFields.price = Number(body.price);
    if (body.originalPrice !== undefined) updateFields.originalPrice = Number(body.originalPrice);
    if (body.stock !== undefined) updateFields.stock = Number(body.stock);
    if (body.summary !== undefined) updateFields.summary = body.summary;
    if (body.image) {
      updateFields.image = {
        src: body.image,
        alt: body.name || existing?.name || "Product image",
        width: 300,
        height: 300,
      };
    }
    if (body.dailyCapacity || body.power || body.weight) {
      updateFields["specs.dailyCapacity"] = body.dailyCapacity;
      updateFields["specs.power"] = body.power;
      updateFields["specs.weight"] = body.weight;
    }

    let updated = null;
    if (existing) {
      updated = await Product.findByIdAndUpdate(existing._id, { $set: updateFields }, { new: true });
    }

    const productName = updated?.name || body.name || id;
    const changeDetails: string[] = [];
    if (body.price !== undefined && body.price !== prevPrice) changeDetails.push(`Price: ₹${prevPrice} → ₹${body.price}`);
    if (body.stock !== undefined && body.stock !== prevStock) changeDetails.push(`Stock: ${prevStock} → ${body.stock}`);
    if (body.title) changeDetails.push(`Title updated`);

    const summaryText = changeDetails.length > 0 ? changeDetails.join(", ") : "Specifications updated";

    // Record Audit Log
    await logAuditEvent({
      actor: user,
      action: "PRODUCT_UPDATED",
      entityType: "product",
      entityId: existing ? String(existing._id) : id,
      metadata: {
        productName,
        slug: existing?.slug || id,
        changes: updateFields,
        details: `${user.name} (${user.role}) updated product "${productName}": ${summaryText}`,
      },
    });

    try {
      revalidateTag("products", "default");
    } catch {}

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("Product PATCH error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const { id } = await params;

    await connectDB();
    const existing = await Product.findOne({ $or: [{ slug: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });

    const productName = existing?.name || id;

    if (existing) {
      await Product.findByIdAndDelete(existing._id);
    }

    // Record Audit Log
    await logAuditEvent({
      actor: user,
      action: "PRODUCT_DELETED",
      entityType: "product",
      entityId: existing ? String(existing._id) : id,
      metadata: {
        productName,
        slug: existing?.slug || id,
        details: `${user.name} (${user.role}) deleted product "${productName}" (ID: ${id})`,
      },
    });

    try {
      revalidateTag("products", "default");
    } catch {}

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Product DELETE error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to delete product" },
      { status: 500 }
    );
  }
}
