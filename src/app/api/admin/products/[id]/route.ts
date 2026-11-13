import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { deleteProductImage } from "@/lib/imagekit";
import { revalidateTag } from "next/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function findByIdOrSlug(id: string) {
  return Product.findOne({ $or: [{ slug: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
}

/** GET /api/admin/products/:id — single product (any status), by id or slug. Admin only — see /api/products/:slug for the published-only public read. */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  try {
    await connectDB();
    const { id } = await params;
    const product = await findByIdOrSlug(id).lean();
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load product" }, { status: 500 });
  }
}

// Fields an admin is allowed to set directly through PATCH. Keeping this explicit (rather than
// spreading the whole body) stops stray client fields — like _id or createdBy — from silently
// overwriting something they shouldn't.
const PATCHABLE_FIELDS = [
  "title", "name", "shortName", "summary", "intro", "overview",
  "sku", "productCode", "model", "manufacturer", "countryOfOrigin", "tags",
  "isFeatured", "isNewArrival", "category", "categoryId", "subcategory", "productType", "brandId",
  "colours", "image", "cardImage", "images", "gallery", "portraitImage", "listImage", "overviewImage",
  "variants", "techSpecs", "features", "applications", "faqs", "warranty", "seo", "relatedProductIds",
  "specs", "sortOrder", "badge", "highlight", "chips",
  "gstApplicable", "gstRate", "taxType",
  "enableStockManagement", "stockStatus", "allowBackorders", "lowStockThreshold",
] as const;

/** PATCH /api/admin/products/:id — partial update. Price/stock changes are recorded to history; slug/SKU changes are validated for uniqueness. */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { user } = authResult;

  try {
    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const existing = await findByIdOrSlug(id);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const updateFields: Record<string, unknown> = {};
    for (const key of PATCHABLE_FIELDS) {
      if (body[key] !== undefined) updateFields[key] = body[key];
    }

    // Slug: re-validate uniqueness if changed.
    if (typeof body.slug === "string" && body.slug.trim()) {
      const nextSlug = body.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
      if (nextSlug !== existing.slug) {
        if (await Product.exists({ slug: nextSlug, _id: { $ne: existing._id } })) {
          return NextResponse.json({ error: `Slug "${nextSlug}" is already in use.` }, { status: 409 });
        }
        updateFields.slug = nextSlug;
      }
    }

    // SKU: re-validate uniqueness if changed.
    if (typeof body.sku === "string" && body.sku.trim()) {
      const nextSku = body.sku.toUpperCase().trim();
      if (nextSku !== existing.sku) {
        if (await Product.exists({ sku: nextSku, _id: { $ne: existing._id } })) {
          return NextResponse.json({ error: `SKU "${nextSku}" is already in use.` }, { status: 409 });
        }
        updateFields.sku = nextSku;
      }
    }

    const prevPrice = existing.price;
    const prevStock = existing.stock;

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: "Price must be a non-negative number." }, { status: 400 });
      }
      updateFields.price = price;
    }
    if (body.originalPrice !== undefined) updateFields.originalPrice = Number(body.originalPrice);
    if (updateFields.price !== undefined || updateFields.originalPrice !== undefined) {
      const price = (updateFields.price as number) ?? existing.price;
      const originalPrice = (updateFields.originalPrice as number) ?? existing.originalPrice;
      updateFields.discountPercent = originalPrice > 0 ? Math.max(0, Math.min(100, Math.round(((originalPrice - price) / originalPrice) * 100))) : 0;
      if (price !== prevPrice) {
        updateFields.$push = {
          priceHistory: { price, originalPrice, changedAt: new Date(), changedBy: user.name ?? undefined },
        };
      }
    }

    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      updateFields.stock = stock;
      if (stock !== prevStock) {
        const movement = {
          type: "adjustment" as const,
          change: stock - (prevStock ?? 0),
          resultingQuantity: stock,
          reason: body.stockChangeReason || "Manual admin update",
          at: new Date(),
          by: user.name ?? undefined,
        };
        updateFields.$push = { ...(updateFields.$push as object | undefined), stockMovements: movement };
      }
    }

    // $push needs to be pulled out of $set.
    const { $push, ...setFields } = updateFields;
    const updateDoc: Record<string, unknown> = { $set: { ...setFields, updatedBy: user.id } };
    if ($push) updateDoc.$push = $push;

    // Synchronize ImageKit deletions: If an admin removed images from the product, delete them from ImageKit
    if (Array.isArray(body.images) && Array.isArray(existing.images)) {
      const newFileIds = new Set(
        body.images
          .map((img: { fileId?: string }) => img?.fileId)
          .filter((id: unknown): id is string => typeof id === "string" && Boolean(id)),
      );
      for (const oldImg of existing.images) {
        if (oldImg.fileId && !newFileIds.has(oldImg.fileId)) {
          try {
            await deleteProductImage(oldImg.fileId);
          } catch (err) {
            console.warn(`[admin/products/patch] Failed to delete removed ImageKit asset ${oldImg.fileId}:`, err);
          }
        }
      }
    }

    const updated = await Product.findByIdAndUpdate(existing._id, updateDoc, { new: true, runValidators: true });

    const productName = updated?.name || existing.name;
    const changeDetails: string[] = [];
    if (body.price !== undefined && body.price !== prevPrice) changeDetails.push(`Price: ₹${prevPrice} → ₹${body.price}`);
    if (body.stock !== undefined && body.stock !== prevStock) changeDetails.push(`Stock: ${prevStock} → ${body.stock}`);
    if (body.title) changeDetails.push("Title updated");
    const summaryText = changeDetails.length > 0 ? changeDetails.join(", ") : "Specifications updated";

    await logAuditEvent({
      actor: user,
      action: "PRODUCT_UPDATED",
      entityType: "product",
      entityId: String(existing._id),
      metadata: {
        productName,
        slug: updated?.slug || existing.slug,
        changes: setFields,
        details: `${user.name} (${user.role}) updated product "${productName}": ${summaryText}`,
      },
    });

    try {
      revalidateTag("products", { expire: 0 });
    } catch {}

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("Product PATCH error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update product" },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/products/:id — refuses to hard-delete a product referenced by any order (PRD §6); archive it instead. */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { user } = authResult;

  try {
    const { id } = await params;
    await connectDB();
    const existing = await findByIdOrSlug(id);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const referencedByOrder = await Order.exists({ "items.product": existing._id });
    if (referencedByOrder) {
      return NextResponse.json(
        { error: "This product is referenced by at least one order and cannot be permanently deleted. Archive it instead." },
        { status: 409 },
      );
    }

    // Delete all associated ImageKit assets when the product is deleted
    if (Array.isArray(existing.images)) {
      for (const img of existing.images) {
        if (img?.fileId) {
          try {
            await deleteProductImage(img.fileId);
          } catch (err) {
            console.warn(`[admin/products/delete] Failed to delete ImageKit asset ${img.fileId}:`, err);
          }
        }
      }
    }

    await Product.findByIdAndDelete(existing._id);

    await logAuditEvent({
      actor: user,
      action: "PRODUCT_DELETED",
      entityType: "product",
      entityId: String(existing._id),
      metadata: {
        productName: existing.name,
        slug: existing.slug,
        details: `${user.name} (${user.role}) permanently deleted product "${existing.name}" (SKU: ${existing.sku || "—"})`,
      },
    });

    try {
      revalidateTag("products", { expire: 0 });
    } catch {}

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Product DELETE error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to delete product" },
      { status: 500 },
    );
  }
}
