import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { QuoteRequest } from "@/models/QuoteRequest";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin", "manager"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { id } = await params;

    const quote = await QuoteRequest.findById(id).lean();
    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    return NextResponse.json({ quote });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin", "manager"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const quote = await QuoteRequest.findById(id);
    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    if (body.status !== undefined) updates.status = body.status;
    if (body.quotedAmount !== undefined) updates.quotedAmount = Number(body.quotedAmount);
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.assignedManager !== undefined) updates.assignedManager = body.assignedManager;
    if (body.assignedManagerName !== undefined) updates.assignedManagerName = body.assignedManagerName;
    if (body.validUntil !== undefined) updates.validUntil = body.validUntil ? new Date(body.validUntil) : null;

    const updated = await QuoteRequest.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();

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
