import "server-only";
import { connectDB } from "@/lib/mongodb";
import { QuoteRequest, type IQuoteRequest } from "@/models/QuoteRequest";
import { getSessionUser } from "@/lib/session";

export type UserQuoteDTO = {
  _id: string;
  quoteNumber: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  preferredModel: string;
  quantity: number;
  expectedDailyUsage: string;
  deliveryCityPostal: string;
  status: IQuoteRequest["status"];
  quotedAmount?: number;
  notes?: string;
  createdAt: string;
};

export async function listOwnedQuotes(): Promise<UserQuoteDTO[]> {
  const user = await getSessionUser();
  if (!user?.id) return [];

  await connectDB();

  const userEmail = (user.email || "").toLowerCase().trim();

  // 1. Fetch user's direct quotation requests
  const filter: Record<string, any> = {
    $or: [
      { user: user.id },
      ...(userEmail ? [{ email: userEmail }] : []),
    ],
  };

  const [quoteDocs, { Order }] = await Promise.all([
    QuoteRequest.find(filter).sort({ createdAt: -1 }).lean(),
    import("@/models/Order"),
  ]);

  const results: UserQuoteDTO[] = quoteDocs.map((q: any) => ({
    _id: String(q._id),
    quoteNumber: q.quoteNumber || "QT-REQUEST",
    organizationName: q.organizationName || "Direct Client",
    contactPerson: q.contactPerson || user.name || "Client",
    email: q.email || userEmail,
    phone: q.phone || "—",
    preferredModel: q.preferredModel || "Pro",
    quantity: q.quantity || 1,
    expectedDailyUsage: q.expectedDailyUsage || "Standard institutional usage",
    deliveryCityPostal: q.deliveryCityPostal || "Standard dispatch",
    status: q.status || "in_review",
    quotedAmount: q.quotedAmount || 0,
    notes: q.notes || "",
    createdAt: q.createdAt ? new Date(q.createdAt).toISOString() : new Date().toISOString(),
  }));

  // 2. Also map any order placed by this user as an Approved Quote/Order in history so nothing is lost
  try {
    const orderFilter: Record<string, any> = {
      $or: [
        { user: user.id },
        ...(userEmail ? [{ "contact.email": userEmail }] : []),
      ],
    };
    const orderDocs = await Order.find(orderFilter).sort({ createdAt: -1 }).lean();

    for (const o of orderDocs as any[]) {
      // Avoid duplicate if already represented by quoteNumber
      if (results.some((r) => r.quoteNumber === o.reference)) continue;

      const firstItem = o.items?.[0];
      results.push({
        _id: String(o._id),
        quoteNumber: o.reference,
        organizationName: o.shippingAddress?.organization || "Institutional Facility",
        contactPerson: o.contact?.fullName || user.name || "Customer",
        email: o.contact?.email || userEmail,
        phone: o.contact?.phone || "—",
        preferredModel: firstItem?.title || firstItem?.slug || "Pro",
        quantity: firstItem?.quantity || 1,
        expectedDailyUsage: firstItem?.specLine || "Standard machine capacity",
        deliveryCityPostal: `${o.shippingAddress?.city || ""}, ${o.shippingAddress?.state || ""}`,
        status: o.status === "delivered" ? "approved" : "quote_sent",
        quotedAmount: o.total || 0,
        notes: `Order Ref: ${o.reference} · Status: ${o.status}`,
        createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
      });
    }
  } catch {
    // Non-blocking fallback
  }

  // Sort newest first
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
