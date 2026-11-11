import { NextRequest } from "next/server";
import { changeProductStatus } from "@/lib/admin/product-actions";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return changeProductStatus(id, "draft", "PRODUCT_UNPUBLISHED");
}
