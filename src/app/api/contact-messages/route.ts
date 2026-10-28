import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { fail, limited, ok, readJson, route, zodFail } from "@/lib/api";
import { contactSchema } from "@/lib/validations/schemas";

export const POST = route(async (req: Request) => {
  // 1. IP-based rate limiting (5 messages per hour)
  const rl = limited(req, "contact", 5, 60 * 60_000);
  if (rl) return rl;

  // 2. Request body JSON validation
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;

  // 3. Zod schema validation
  const parsed = contactSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  const { name, email, phone, enquiryType, model, orderReference, message, consent, websiteUrl } = parsed.data;

  // 4. Anti-bot honeypot check
  if (websiteUrl && websiteUrl.trim().length > 0) {
    return fail("Request blocked by security filter.", 400);
  }

  // 5. Anti-spam: reject link stuffing (more than 2 URLs in a message)
  const urlCount = (message.match(/https?:\/\//gi) || []).length;
  if (urlCount > 2) {
    return fail("Messages containing multiple web links are not allowed for security reasons.", 400, {
      message: "Please remove web links from your message.",
    });
  }

  // 6. Anti-XSS / script injection check
  if (/<script|javascript:|data:text\/html/i.test(message) || /<script|javascript:/i.test(name)) {
    return fail("Invalid characters or HTML detected in submission.", 400);
  }

  // 7. Save ContactMessage to database
  await connectDB();
  const doc = await ContactMessage.create({
    name,
    email,
    phone,
    enquiryType,
    model,
    orderReference,
    message,
    consent,
  });

  let leadId = "";
  let leadNumber = "";

  // Auto-create Lead in pipeline so it is tracked by both Admin and Managers
  try {
    const { Lead } = await import("@/models/Lead");
    const { Counter } = await import("@/models/Counter");
    const counter = await Counter.findByIdAndUpdate(
      "leadNumber",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seq = (counter?.seq || 1) + 1000;
    leadNumber = `LD-${seq}`;

    const leadDoc = await Lead.create({
      leadNumber,
      name,
      institution: enquiryType === "Sales" ? "Sales Enquiry" : "Service Enquiry",
      institutionType: "Other",
      email,
      phone,
      source: "website",
      status: "new",
      priority: enquiryType === "Sales" ? "high" : "medium",
      preferredModel: model || "pro",
      notes: `Customer Message (${enquiryType}): ${message}${
        orderReference ? ` [Order Ref: ${orderReference}]` : ""
      }`,
      activities: [
        {
          type: "note",
          description: `Website enquiry received from ${name} (Mobile: ${phone})`,
          performedByName: name,
          createdAt: new Date(),
        },
      ],
    });
    leadId = String(leadDoc._id);
  } catch (leadErr) {
    console.warn("Failed to create Lead from contact message:", leadErr);
  }

  // Broadcast real-time notification to BOTH Super Admin and Managers
  try {
    const { createNotification } = await import("@/lib/notifications");
    await createNotification({
      title: leadNumber ? `New Lead Received: ${leadNumber}` : "New Customer Enquiry",
      message: `${name} (${enquiryType}) • Mobile: ${phone} • "${message.slice(0, 50)}..."`,
      type: "lead_created",
      targetRole: "all",
      entityType: "lead",
      entityId: leadId || undefined,
      link: "/admin/leads",
    });
  } catch {
    // Non-blocking notification
  }

  // Record Audit Trail
  try {
    const { logAuditEvent } = await import("@/lib/audit");
    await logAuditEvent({
      action: "LEAD_CREATED",
      entityType: "lead",
      entityId: leadId || undefined,
      metadata: {
        leadNumber,
        name,
        phone,
        email,
        source: "website_enquiry",
        details: `Customer ${name} (Mobile: ${phone}) submitted an enquiry for ${enquiryType}`,
      },
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }

  return ok({ id: String(doc._id), leadNumber }, 201);
});
