import { connectDB, isDatabaseUnavailable } from "@/lib/mongodb";
import { QuoteRequest } from "@/models/QuoteRequest";
import { fail, limited, ok, readJson, zodFail, route } from "@/lib/api";
import { quoteRequestSchema } from "@/lib/validations/schemas";

export const POST = route(async (req: Request) => {
  const rl = limited(req, "quote", 5, 60 * 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = quoteRequestSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  if (parsed.data.websiteUrl && parsed.data.websiteUrl.trim().length > 0) {
    return fail("Request blocked by security filter.", 400);
  }

  try {
    await connectDB();
    
    // Robust quote number generation using nextSequence
    let quoteNumber = `QT-2026-${Date.now().toString().slice(-4)}`;
    try {
      const { nextSequence } = await import("@/models/Counter");
      const seq = await nextSequence("quote_number");
      quoteNumber = `QT-2026-${String(seq).padStart(3, "0")}`;
    } catch {
      const count = await QuoteRequest.countDocuments();
      quoteNumber = `QT-2026-${String(count + 1).padStart(3, "0")}`;
    }

    let userId: string | null = null;
    try {
      const { getSessionUserId } = await import("@/lib/session");
      userId = await getSessionUserId();
    } catch {
      // Guest or session read without context
    }

    let userObjectId = null;
    if (userId) {
      const mongoose = await import("mongoose");
      userObjectId = new mongoose.Types.ObjectId(userId);
    }

    const payload = {
      organizationName: parsed.data.organizationName,
      institutionType: parsed.data.institutionType,
      contactPerson: parsed.data.contactPerson,
      role: parsed.data.role || "",
      email: parsed.data.email,
      phone: parsed.data.phone,
      preferredModel: parsed.data.preferredModel,
      quantity: parsed.data.quantity,
      expectedDailyUsage: parsed.data.expectedDailyUsage,
      deliveryCityPostal: parsed.data.deliveryCityPostal,
      useCase: (parsed.data.useCase && parsed.data.useCase.trim()) || "Institutional sanitary disposal",
      installationRequirements: (parsed.data.installationRequirements && parsed.data.installationRequirements.trim()) || "Standard site installation",
      consent: parsed.data.consent,
      quoteNumber,
      status: "new" as const,
      user: userObjectId,
    };

    const doc: any = await QuoteRequest.create(payload);

    // Auto-create Lead in pipeline so it appears in both Admin and Manager lead dashboards
    try {
      const { Lead } = await import("@/models/Lead");
      const { Counter } = await import("@/models/Counter");
      const counter = await Counter.findByIdAndUpdate(
        "leadNumber",
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const seq = (counter?.seq || 1) + 1000;
      const leadNumber = `LD-${seq}`;

      await Lead.create({
        leadNumber,
        name: parsed.data.contactPerson,
        institution: parsed.data.organizationName,
        institutionType: parsed.data.institutionType || "Other",
        email: parsed.data.email,
        phone: parsed.data.phone,
        source: "institutional_quote",
        status: "new",
        priority: "high",
        preferredModel: parsed.data.preferredModel,
        quantity: parsed.data.quantity,
        city: parsed.data.deliveryCityPostal,
        notes: `Institutional Quote Request #${quoteNumber}. Daily usage: ${parsed.data.expectedDailyUsage}. Requirement: ${parsed.data.useCase || "Institutional Sanitary Hygiene"}`,
        activities: [
          {
            type: "note",
            description: `Quote request #${quoteNumber} submitted via website for ${parsed.data.quantity} unit(s) of ${parsed.data.preferredModel}.`,
            performedByName: parsed.data.contactPerson,
            createdAt: new Date(),
          },
        ],
      });
    } catch (leadErr) {
      console.warn("Lead auto-creation skipped:", leadErr);
    }

    // Broadcast alert to both Super Admin and Managers
    try {
      const { createNotification } = await import("@/lib/notifications");
      await createNotification({
        title: "New Institutional Quotation Request",
        message: `${parsed.data.organizationName} (${parsed.data.contactPerson}) requested quote for ${parsed.data.preferredModel || "RMAX Solutions"} (Qty: ${parsed.data.quantity})`,
        type: "lead_created",
        targetRole: "all",
        link: "/admin/quotations",
      });
    } catch (notifErr) {
      console.warn("Notification skipped:", notifErr);
    }

    // Record Audit Trail
    try {
      const { logAuditEvent } = await import("@/lib/audit");
      await logAuditEvent({
        action: "QUOTATION_REQUESTED",
        entityType: "quotation",
        entityId: String(doc._id),
        metadata: {
          quoteNumber,
          organizationName: parsed.data.organizationName,
          contactPerson: parsed.data.contactPerson,
          phone: parsed.data.phone,
          preferredModel: parsed.data.preferredModel,
          quantity: parsed.data.quantity,
          details: `Quotation #${quoteNumber} requested by ${parsed.data.contactPerson} (${parsed.data.organizationName}, Mobile: ${parsed.data.phone}) for ${parsed.data.quantity}x ${parsed.data.preferredModel}`,
        },
      });
    } catch (auditErr) {
      console.warn("Audit log skipped:", auditErr);
    }

    // Record Audit Trail
    try {
      const { logAuditEvent } = await import("@/lib/audit");
      await logAuditEvent({
        action: "QUOTATION_REQUESTED",
        entityType: "quotation",
        entityId: String(doc._id),
        metadata: {
          quoteNumber,
          organizationName: parsed.data.organizationName,
          contactPerson: parsed.data.contactPerson,
          phone: parsed.data.phone,
          preferredModel: parsed.data.preferredModel,
          quantity: parsed.data.quantity,
          details: `Quotation #${quoteNumber} requested by ${parsed.data.contactPerson} (${parsed.data.organizationName}, Mobile: ${parsed.data.phone}) for ${parsed.data.quantity}x ${parsed.data.preferredModel}`,
        },
      });
    } catch (auditErr) {
      console.warn("Audit log skipped:", auditErr);
    }

    return ok({ id: String(doc._id), quoteNumber }, 201);
  } catch (err: any) {
    console.error("POST /api/quote-requests error:", err);
    if (isDatabaseUnavailable(err)) throw err;
    const detail = err?.message ? `: ${err.message}` : "";
    return fail(`We could not save your request${detail}. Please try again.`, 500);
  }
});
