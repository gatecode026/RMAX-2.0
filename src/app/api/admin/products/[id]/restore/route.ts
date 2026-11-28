import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { checkApiPermission } from "@/lib/permissions-server";
import { restoreProduct } from "@/lib/product-delete";
import { revalidateTag } from "next/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function findByIdOrSlug(id: string) {
  return Product.findOne({ $or: [{ slug: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
}

/** POST /api/admin/products/:id/restore — restores a soft-deleted product from Trash */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  const authResult = await checkApiPermission("productsDelete");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { user } = authResult;

  try {
    const { id } = await params;
    await connectDB();
    const existing = await findByIdOrSlug(id);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const outcome = await restoreProduct(existing, user);
    if (!outcome.ok) return NextResponse.json({ error: outcome.error }, { status: outcome.status });

    try {
      revalidateTag("products", { expire: 0 });
    } catch {}

    return NextResponse.json({ success: true, message: "Product restored successfully" });
  } catch (err) {
    console.error("Product RESTORE error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to restore product" },
      { status: 500 },
    );
  }
}
