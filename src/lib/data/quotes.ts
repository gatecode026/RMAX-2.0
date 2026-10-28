import "server-only";
import { connectDB } from "@/lib/mongodb";
import { QuoteRequest, type IQuoteRequest } from "@/models/QuoteRequest";
import { getSessionUser, getSessionUserId } from "@/lib/session";

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

  // Find quotes linked by userId or matching the user's registered email
  const filter: Record<string, any> = {
    $or: [
      { user: user.id },
      ...(user.email ? [{ email: user.email.toLowerCase().trim() }] : []),
    ],
  };

  const docs = await QuoteRequest.find(filter).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}
