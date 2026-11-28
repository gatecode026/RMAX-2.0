import "server-only";
import { Types } from "mongoose";
import { Product, type IProduct } from "@/models/Product";
import { Order } from "@/models/Order";
import { QuoteRequest } from "@/models/QuoteRequest";
import { deleteProductImage } from "@/lib/imagekit";
import { logAuditEvent } from "@/lib/audit";
import type { SessionUser } from "@/lib/session";

type Doc = Pick<IProduct, "name" | "slug" | "sku" | "images"> & { _id: Types.ObjectId };

export type DeleteOutcome = { ok: true } | { ok: false; status: number; error: string };

/**
 * Soft delete (move to Trash):
 * Keeps all data, options, and ImageKit assets intact so the product can be restored at any time.
 * Marks the product with isDeleted: true, deletedAt, deletedBy.
 */
export async function softDeleteProduct(existing: Doc, actor: SessionUser): Promise<DeleteOutcome> {
  await Product.findByIdAndUpdate(existing._id, {
    $set: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: actor.id && Types.ObjectId.isValid(actor.id) ? new Types.ObjectId(actor.id) : undefined,
    },
  });

  await logAuditEvent({
    actor,
    action: "PRODUCT_TRASHED",
    entityType: "product",
    entityId: String(existing._id),
    metadata: {
      productName: existing.name,
      slug: existing.slug,
      details: `${actor.name} (${actor.role}) moved product "${existing.name}" (SKU: ${existing.sku || "—"}) to Trash`,
    },
  });

  return { ok: true };
}

/**
 * Restore product from Trash:
 * Unsets isDeleted, deletedAt, and deletedBy.
 */
export async function restoreProduct(existing: Doc, actor: SessionUser): Promise<DeleteOutcome> {
  await Product.findByIdAndUpdate(existing._id, {
    $set: {
      isDeleted: false,
    },
    $unset: {
      deletedAt: 1,
      deletedBy: 1,
    },
  });

  await logAuditEvent({
    actor,
    action: "PRODUCT_RESTORED",
    entityType: "product",
    entityId: String(existing._id),
    metadata: {
      productName: existing.name,
      slug: existing.slug,
      details: `${actor.name} (${actor.role}) restored product "${existing.name}" (SKU: ${existing.sku || "—"}) from Trash`,
    },
  });

  return { ok: true };
}

/**
 * The single deletion policy, used by both the one-product and the bulk endpoints:
 *  - blocked when an order or a quotation request references the product (archive it instead);
 *  - its ImageKit files are removed, except files another product still uses (e.g. a duplicate).
 */
export async function deleteProductWithPolicy(existing: Doc, actor: SessionUser): Promise<DeleteOutcome> {
  if (await Order.exists({ "items.product": existing._id })) {
    return { ok: false, status: 409, error: "Referenced by at least one order — archive it instead." };
  }
  if (await QuoteRequest.exists({ preferredModel: existing.slug })) {
    return { ok: false, status: 409, error: "Referenced by at least one quotation request — archive it instead." };
  }

  const fileIds = (Array.isArray(existing.images) ? existing.images : []).map((i) => i?.fileId).filter((f): f is string => Boolean(f));
  const stillUsed = fileIds.length
    ? new Set(
        (await Product.find({ _id: { $ne: existing._id }, "images.fileId": { $in: fileIds } }).select("images.fileId").lean()).flatMap((p) =>
          (p.images ?? []).map((i) => i.fileId),
        ),
      )
    : new Set<string>();

  for (const fileId of fileIds) {
    if (stillUsed.has(fileId)) continue;
    try {
      await deleteProductImage(fileId);
    } catch (err) {
      console.warn(`[product-delete] Failed to delete ImageKit asset ${fileId}:`, err);
    }
  }

  await Product.findByIdAndDelete(existing._id);

  await logAuditEvent({
    actor,
    action: "PRODUCT_DELETED",
    entityType: "product",
    entityId: String(existing._id),
    metadata: {
      productName: existing.name,
      slug: existing.slug,
      details: `${actor.name} (${actor.role}) permanently deleted product "${existing.name}" (SKU: ${existing.sku || "—"})`,
    },
  });
  return { ok: true };
}
