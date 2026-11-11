import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProductReview } from "@/models/ProductReview";
import { checkApiRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  const authResult = await checkApiRole(["super_admin", "admin", "manager"]);
  if ("error" in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const productSlug = searchParams.get("productSlug");
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (productSlug) filter.productSlug = productSlug;

    const reviews = await ProductReview.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    const pendingCount = await ProductReview.countDocuments({ status: "pending" });
    return NextResponse.json({ success: true, reviews, pendingCount });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load reviews" }, { status: 500 });
  }
}
