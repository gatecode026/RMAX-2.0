import { NextRequest } from "next/server";
import { duplicateProduct } from "@/lib/admin/product-actions";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return duplicateProduct(id);
}
