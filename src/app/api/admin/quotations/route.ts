import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { QuoteRequest } from "@/models/QuoteRequest";
import { nextSequence } from "@/models/Counter";
import { checkApiRole } from "@/lib/session";
import { checkApiPermission } from "@/lib/permissions-server";
import { getVariantLabel } from "@/lib/variant-label";
import { logAuditEvent } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const authResult = await checkApiPermission("leadsView");
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "all";

    const query: Record<string, any> = {};

    // A manager sees the quotations assigned to them plus unassigned ones (same rule as leads).
    if (!authResult.isAdmin) {
      query.$and = [{ $or: [{ assignedManager: authResult.user.id }, { assignedManager: null }, { assignedManager: { $exists: false } }] }];
    }

    if (status !== "all") {
      query.status = status;
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 40);
      (query.$and ??= []).push({ $or: [
        { quoteNumber: { $regex: escapedSearch, $options: "i" } },
        { organizationName: { $regex: escapedSearch, $options: "i" } },
        { contactPerson: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
        { preferredModel: { $regex: escapedSearch, $options: "i" } },
      ] });
    }

    // Server-side paging. Filters and the manager's scope are already in `query`, so they apply before
    // counting and slicing. Every sort ends with _id so equal values keep a stable order and a record can
    // never repeat or vanish between pages.
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10) || 25));
    const sortKey = searchParams.get("sort") || "newest";
    const sort: Record<string, 1 | -1> =
      sortKey === "oldest" ? { createdAt: 1, _id: 1 }
      : sortKey === "amount-desc" ? { quotedAmount: -1, _id: -1 }
      : sortKey === "amount-asc" ? { quotedAmount: 1, _id: 1 }
      : { createdAt: -1, _id: -1 };
    const total = await QuoteRequest.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(totalPages, Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)); // clamp: an emptied last page falls back
    const quotes = await QuoteRequest.find(query).sort(sort).skip((page - 1) * pageSize).limit(pageSize).lean();

    const withLabel = await Promise.all(quotes.map(async (q) => ({ ...q, variantLabel: q.variantLabel ?? (await getVariantLabel(q.preferredModel)) ?? undefined })));
    return NextResponse.json({ quotes: withLabel, total, page, pageSize, totalPages });
  } catch (err: any) {
    console.error("GET /api/admin/quotations error:", err);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkApiPermission("leadsEdit");
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    await connectDB();
    const body = await req.json();

    if (!body.organizationName || !body.contactPerson || !body.email || !body.preferredModel) {
      return NextResponse.json({ error: "Missing required quotation fields" }, { status: 400 });
    }

    const seq = await nextSequence("quotation");
    const quoteNumber = `QT-${1000 + seq}`;

    const quoteDoc = await QuoteRequest.create({
      quoteNumber,
      organizationName: body.organizationName.trim(),
      institutionType: body.institutionType || "Schools",
      contactPerson: body.contactPerson.trim(),
      role: body.role?.trim() || "",
      email: body.email.toLowerCase().trim(),
      phone: body.phone?.trim() || "",
      preferredModel: body.preferredModel,
      quantity: Number(body.quantity) || 1,
      expectedDailyUsage: body.expectedDailyUsage || "50-100 pads",
      deliveryCityPostal: body.deliveryCityPostal || "",
      useCase: body.useCase || "Institutional Sanitary Hygiene",
      installationRequirements: body.installationRequirements || "Standard 230V wall socket",
      consent: true,
      status: body.status || "new",
      quotedAmount: body.quotedAmount ? Number(body.quotedAmount) : 0,
      notes: body.notes?.trim() || "",
      assignedManager: body.assignedManagerId || user.id,
      assignedManagerName: body.assignedManagerName || user.name || "Assigned Manager",
      createdByStaff: true,
      variantLabel: (await getVariantLabel(body.preferredModel)) ?? undefined,
    });

    // Notify Super Admin & Manager
    await createNotification({
      title: "New Institutional Quotation Created",
      message: `${quoteNumber} for ${quoteDoc.organizationName} created by ${user.name || "Admin"}.`,
      type: "lead_created",
      targetRole: "super_admin",
      entityType: "order",
      entityId: quoteNumber,
      link: "/admin/quotations",
    });

    // Log Audit Event
    await logAuditEvent({
      actor: user,
      action: "quotation_created",
      entityType: "quotation",
      entityId: quoteNumber,
      metadata: {
        quoteNumber,
        organizationName: quoteDoc.organizationName,
        preferredModel: quoteDoc.preferredModel,
        quantity: quoteDoc.quantity,
      },
    });

    return NextResponse.json({ ok: true, quote: quoteDoc }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/quotations error:", err);
    return NextResponse.json({ error: err.message || "Failed to create quotation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    await connectDB();
    const body = await req.json();
    const { ids, userEmail, userId } = body;

    let deleteFilter: Record<string, any> = {};

    if (Array.isArray(ids) && ids.length > 0) {
      deleteFilter = { _id: { $in: ids } };
    } else if (userEmail && typeof userEmail === "string") {
      deleteFilter = { email: userEmail.toLowerCase().trim() };
    } else if (userId && typeof userId === "string") {
      deleteFilter = { user: userId };
    } else {
      return NextResponse.json(
        { error: "Must provide either ids (array of IDs) or userEmail / userId to delete." },
        { status: 400 }
      );
    }

    const deleteResult = await QuoteRequest.deleteMany(deleteFilter);

    // Log Audit Event
    await logAuditEvent({
      actor: user,
      action: "quotations_bulk_deleted",
      entityType: "quotation",
      entityId: "bulk-delete",
      metadata: {
        deletedCount: deleteResult.deletedCount,
        filter: deleteFilter,
        targetEmail: userEmail || undefined,
        targetIds: ids || undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      deletedCount: deleteResult.deletedCount,
      message: `Successfully deleted ${deleteResult.deletedCount} quotation(s).`,
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/quotations error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to perform bulk deletion" },
      { status: 500 }
    );
  }
}
