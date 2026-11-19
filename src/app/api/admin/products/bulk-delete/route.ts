import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { checkApiPermission } from "@/lib/permissions-server";
import { deleteProductWithPolicy } from "@/lib/product-delete";

const MAX_IDS = 100;
const isObjectId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

/**
 * POST /api/admin/products/bulk-delete { ids } — deletes each product under the same policy as the
 * single delete. Always answers per id: `deleted` ids and `failed` { id, name, error } entries, so
 * the UI can keep failures selected for retry. Admins, or managers with "Delete products".
 */
export async function POST(req: NextRequest) {
  const auth = await checkApiPermission("productsDelete");
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: { ids?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const ids = Array.isArray(body.ids) ? [...new Set(body.ids)] : [];
  if (!ids.length || ids.length > MAX_IDS || !ids.every(isObjectId)) {
    return NextResponse.json({ error: `Send between 1 and ${MAX_IDS} valid product ids.` }, { status: 422 });
  }

  await connectDB();
  const deleted: string[] = [];
  const failed: { id: string; name: string; error: string }[] = [];
  for (const id of ids as string[]) {
    try {
      const existing = await Product.findById(id);
      if (!existing) {
        // Already gone (e.g. deleted from another tab) — the end state is what the user wanted.
        deleted.push(id);
        continue;
      }
      const outcome = await deleteProductWithPolicy(existing, auth.user);
      if (outcome.ok) deleted.push(id);
      else failed.push({ id, name: existing.name, error: outcome.error });
    } catch (err) {
      failed.push({ id, name: "Unknown product", error: err instanceof Error ? err.message : "Failed to delete" });
    }
  }

  if (deleted.length) {
    try {
      revalidateTag("products", { expire: 0 });
    } catch {}
  }
  return NextResponse.json({ success: failed.length === 0, deleted, failed }, { status: failed.length && !deleted.length ? 409 : 200 });
}
