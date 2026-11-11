import "server-only";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Product, type ProductStatus } from "@/models/Product";
import { checkApiRole, type SessionUser } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";

function findByIdOrSlug(id: string) {
  return Product.findOne({ $or: [{ slug: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
}

/** Shared handler for the publish/unpublish/archive status-change endpoints. */
export async function changeProductStatus(id: string, nextStatus: ProductStatus, action: string) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { user } = authResult;

  try {
    await connectDB();
    const existing = await findByIdOrSlug(id);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (nextStatus === "published") {
      const missing: string[] = [];
      if (!existing.image?.src) missing.push("a main product image");
      if (!existing.name) missing.push("a product name");
      if (existing.price === undefined || existing.price === null) missing.push("a price");
      if (missing.length > 0) {
        return NextResponse.json(
          { error: `Cannot publish — missing ${missing.join(", ")}.` },
          { status: 422 },
        );
      }
    }

    const update: Record<string, unknown> = { status: nextStatus, updatedBy: user.id };
    if (nextStatus === "published") update.publishedAt = new Date();

    const updated = await Product.findByIdAndUpdate(existing._id, { $set: update }, { new: true });

    await logAuditEvent({
      actor: user as SessionUser,
      action,
      entityType: "product",
      entityId: String(existing._id),
      metadata: {
        productName: existing.name,
        slug: existing.slug,
        details: `${user.name} (${user.role}) changed product "${existing.name}" status to ${nextStatus}`,
      },
    });

    try {
      revalidateTag("products", { expire: 0 });
    } catch {}

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error(`Product ${action} error:`, err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to update product status" }, { status: 500 });
  }
}

/** Clones a product as a new draft — new slug/SKU, zeroed stock, no price/stock history carried over. */
export async function duplicateProduct(id: string) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { user } = authResult;

  try {
    await connectDB();
    const existing = await findByIdOrSlug(id);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const { _id: _omitId, createdAt: _omitCreatedAt, updatedAt: _omitUpdatedAt, ...source } = existing.toObject();
    void _omitId;
    void _omitCreatedAt;
    void _omitUpdatedAt;

    let slug = `${source.slug}-copy`;
    let n = 2;
    while (await Product.exists({ slug })) {
      slug = `${source.slug}-copy-${n}`;
      n++;
    }

    let sku = source.sku ? `${source.sku}-COPY` : undefined;
    if (sku) {
      let suffix = 2;
      while (await Product.exists({ sku })) {
        sku = `${source.sku}-COPY-${suffix}`;
        suffix++;
      }
    }

    const duplicate = await Product.create({
      ...source,
      name: `${source.name} (Copy)`,
      title: `${source.title} (Copy)`,
      slug,
      sku,
      status: "draft",
      publishedAt: undefined,
      priceHistory: [],
      stockMovements: [],
      createdBy: user.id,
      updatedBy: user.id,
    });

    await logAuditEvent({
      actor: user as SessionUser,
      action: "PRODUCT_DUPLICATED",
      entityType: "product",
      entityId: String(duplicate._id),
      metadata: {
        productName: duplicate.name,
        slug: duplicate.slug,
        details: `${user.name} (${user.role}) duplicated product "${existing.name}" as "${duplicate.name}" (draft)`,
      },
    });

    return NextResponse.json({ success: true, product: duplicate }, { status: 201 });
  } catch (err) {
    console.error("Product duplicate error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to duplicate product" }, { status: 500 });
  }
}
