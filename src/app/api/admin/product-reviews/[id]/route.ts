import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProductReview } from "@/models/ProductReview";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const ALLOWED_STATUSES = new Set(["pending", "approved", "rejected", "hidden"]);

/** PATCH { status } — approve / reject / hide. Never auto-approved; always an explicit admin action. */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const authResult = await checkApiRole(["super_admin", "admin", "manager"]);
  if ("error" in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  const { user } = authResult;
  try {
    const { id } = await params;
    const body = await req.json();
    if (!ALLOWED_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "status must be one of pending, approved, rejected, hidden." }, { status: 400 });
    }
    await connectDB();
    const updated = await ProductReview.findByIdAndUpdate(
      id,
      { $set: { status: body.status, moderatedBy: user.id, moderatedAt: new Date() } },
      { new: true },
    );
    if (!updated) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    await logAuditEvent({
      actor: user,
      action: "PRODUCT_REVIEW_MODERATED",
      entityType: "product_review",
      entityId: id,
      metadata: {
        productSlug: updated.productSlug,
        newStatus: body.status,
        details: `${user.name} (${user.role}) set review by "${updated.customerName}" on ${updated.productSlug} to ${body.status}`,
      },
    });
    return NextResponse.json({ success: true, review: updated });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  const { user } = authResult;
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await ProductReview.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    await logAuditEvent({
      actor: user,
      action: "PRODUCT_REVIEW_DELETED",
      entityType: "product_review",
      entityId: id,
      metadata: { productSlug: deleted.productSlug, customerName: deleted.customerName },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete review" }, { status: 500 });
  }
}
