import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { QuoteRequest } from "@/models/QuoteRequest";
import { User } from "@/models/User";
import { getVariantLabel } from "@/lib/variant-label";
import { checkApiRole } from "@/lib/session";
import { checkApiPermission } from "@/lib/permissions-server";
import { logAuditEvent } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkApiPermission("leadsView");
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { id } = await params;

    const quote = await QuoteRequest.findById(id).lean();
    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }
    if (!authResult.isAdmin && quote.assignedManager && String(quote.assignedManager) !== authResult.user.id) {
      return NextResponse.json({ error: "Forbidden: this quotation is assigned to another manager" }, { status: 403 });
    }

    return NextResponse.json({ quote: { ...quote, variantLabel: quote.variantLabel ?? (await getVariantLabel(quote.preferredModel)) ?? undefined } });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkApiPermission("leadsEdit");
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user, isAdmin, permissions } = authResult;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const quote = await QuoteRequest.findById(id);
    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }
    if (!isAdmin && quote.assignedManager && String(quote.assignedManager) !== user.id) {
      return NextResponse.json({ error: "Forbidden: this quotation is assigned to another manager" }, { status: 403 });
    }
    // Changing who owns a quotation is the assign permission, not plain edit.
    if ((body.assignedManager !== undefined || body.assignedManagerName !== undefined) && !isAdmin && !permissions.leadsAssign) {
      return NextResponse.json({ error: "Forbidden: you do not have permission to assign or reassign" }, { status: 403 });
    }
    if (body.assignedManager && !/^[0-9a-fA-F]{24}$/.test(String(body.assignedManager))) {
      return NextResponse.json({ error: "Invalid manager id" }, { status: 400 });
    }
    if (body.quotedAmount !== undefined && !(Number.isFinite(Number(body.quotedAmount)) && Number(body.quotedAmount) >= 0)) {
      return NextResponse.json({ error: "Quoted amount must be a non-negative number" }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    if (body.status !== undefined) updates.status = body.status;
    if (body.quotedAmount !== undefined) updates.quotedAmount = Number(body.quotedAmount);
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.assignedManager !== undefined) {
      if (!body.assignedManager) {
        updates.assignedManager = null;
        updates.assignedManagerName = "";
      } else {
        // Same eligibility as the lead workflow: an active manager or admin. The name comes from the account, never from the client.
        const target = await User.findOne({ _id: body.assignedManager, role: { $in: ["manager", "admin", "super_admin"] }, status: { $ne: "inactive" } }).select("name").lean();
        if (!target) return NextResponse.json({ error: "Invalid manager selected" }, { status: 400 });
        updates.assignedManager = target._id;
        updates.assignedManagerName = target.name;
      }
    }
    if (body.validUntil !== undefined) updates.validUntil = body.validUntil ? new Date(body.validUntil) : null;

    const updated = await QuoteRequest.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean();

    // Log Audit Event
    await logAuditEvent({
      actor: user,
      action: "quotation_updated",
      entityType: "quotation",
      entityId: quote.quoteNumber || id,
      metadata: {
        quoteNumber: quote.quoteNumber,
        changes: updates,
      },
    });

    // Notify if status changed to approved or quote_sent
    if (body.status && body.status !== quote.status) {
      await createNotification({
        title: `Quotation Status: ${body.status.toUpperCase().replace("_", " ")}`,
        message: `${quote.quoteNumber || "Quote"} for ${quote.organizationName} updated by ${user.name || "Admin"}.`,
        type: "lead_status_changed",
        targetRole: "super_admin",
        entityType: "order",
        entityId: quote.quoteNumber,
        link: "/admin/quotations",
      });
    }

    return NextResponse.json({ ok: true, quote: updated });
  } catch (err: any) {
    if (err?.name === "ValidationError") return NextResponse.json({ error: "Invalid value for status or another field" }, { status: 400 });
    console.error("PATCH /api/admin/quotations/[id] error:", err);
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    await connectDB();
    const { id } = await params;

    const deleted = await QuoteRequest.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    await logAuditEvent({
      actor: user,
      action: "quotation_deleted",
      entityType: "quotation",
      entityId: deleted.quoteNumber || id,
      metadata: { quoteNumber: deleted.quoteNumber, organization: deleted.organizationName },
    });

    return NextResponse.json({ ok: true, message: "Quotation removed" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 });
  }
}
