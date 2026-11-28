import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { checkApiPermission } from "@/lib/permissions-server";
import { restoreProduct } from "@/lib/product-delete";

const MAX_IDS = 100;
const isObjectId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

/**
 * POST /api/admin/products/bulk-restore { ids: string[] } — restores each product from Trash
 * back to active catalogue.
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
  const restored: string[] = [];
  const failed: { id: string; name: string; error: string }[] = [];
  for (const id of ids as string[]) {
    try {
      const existing = await Product.findById(id);
      if (!existing) {
        failed.push({ id, name: "Product not found", error: "Product does not exist" });
        continue;
      }
      const outcome = await restoreProduct(existing, auth.user);
      if (outcome.ok) restored.push(id);
      else failed.push({ id, name: existing.name, error: outcome.error });
    } catch (err) {
      failed.push({ id, name: "Unknown product", error: err instanceof Error ? err.message : "Failed to restore" });
    }
  }

  if (restored.length) {
    try {
      revalidateTag("products", { expire: 0 });
    } catch {}
  }
  return NextResponse.json({ success: failed.length === 0, restored, failed }, { status: failed.length && !restored.length ? 409 : 200 });
}
