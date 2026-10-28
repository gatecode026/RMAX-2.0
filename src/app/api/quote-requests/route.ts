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
    const count = await QuoteRequest.countDocuments();
    const quoteNumber = `QT-2026-${String(count + 1).padStart(3, "0")}`;

    let userId: string | null = null;
    try {
      const { getSessionUserId } = await import("@/lib/session");
      userId = await getSessionUserId();
    } catch {
      // Guest or session read without context
    }

    const doc = await QuoteRequest.create({
      ...parsed.data,
      quoteNumber,
      status: "new",
      user: userId || null,
    });

    try {
      const { createNotification } = await import("@/lib/notifications");
      await createNotification({
        title: "New Institutional Quotation Request",
        message: `${parsed.data.organizationName} (${parsed.data.contactPerson}) requested quote for ${parsed.data.preferredModel || "RMAX Solutions"}`,
        type: "lead_created",
        link: "/admin/quotations",
      });
    } catch {
      // Non-blocking notification
    }

    return ok({ id: String(doc._id), quoteNumber }, 201);
  } catch (err) {
    if (isDatabaseUnavailable(err)) throw err;
    return fail("We could not save your request. Please try again.", 500);
  }
});
