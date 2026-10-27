import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { QuoteRequest } from "@/models/QuoteRequest";
import { nextSequence } from "@/models/Counter";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin", "manager"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "all";

    const query: Record<string, any> = {};

    if (status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { quoteNumber: { $regex: search, $options: "i" } },
        { organizationName: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { preferredModel: { $regex: search, $options: "i" } },
      ];
    }

    const quotes = await QuoteRequest.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ quotes });
  } catch (err: any) {
    console.error("GET /api/admin/quotations error:", err);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin", "manager"]);
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
