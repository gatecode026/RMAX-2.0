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

  const quoteDocs = await QuoteRequest.find(filter).sort({ createdAt: -1 }).lean();

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

  // Orders are NOT listed here: they have their own section (My Orders → /account/orders).

  // Sort newest first
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
