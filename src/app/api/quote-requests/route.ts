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
      useCase: parsed.data.useCase || "",
      installationRequirements: parsed.data.installationRequirements || "",
      consent: parsed.data.consent,
      quoteNumber,
      status: "new" as const,
      user: userObjectId,
    };

    const doc: any = await QuoteRequest.create(payload);

    try {
      const { createNotification } = await import("@/lib/notifications");
      await createNotification({
        title: "New Institutional Quotation Request",
        message: `${parsed.data.organizationName} (${parsed.data.contactPerson}) requested quote for ${parsed.data.preferredModel || "RMAX Solutions"}`,
        type: "lead_created",
        link: "/admin/quotations",
      });
    } catch (notifErr) {
      console.warn("Notification skipped:", notifErr);
    }

    return ok({ id: String(doc._id), quoteNumber }, 201);
  } catch (err: any) {
    console.error("POST /api/quote-requests error:", err);
    if (isDatabaseUnavailable(err)) throw err;
    const detail = err?.message ? `: ${err.message}` : "";
    return fail(`We could not save your request${detail}. Please try again.`, 500);
  }
});
