import "server-only";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { Order, type IOrder } from "@/models/Order";
import { getSessionUserId } from "@/lib/session";
import { LAST_ORDER_COOKIE } from "@/lib/constants";

export type OrderDTO = Omit<IOrder, "user" | "items" | "timeline" | "termsAcceptedAt"> & {
  _id: string;
  user?: string;
  items: (Omit<IOrder["items"][number], "product"> & { product: string })[];
  timeline: { step: IOrder["status"]; at?: string }[];
  createdAt: string;
};

/** Convert a lean Mongoose order into a JSON-safe DTO. */
export function toOrderDTO(doc: unknown): OrderDTO {
  return JSON.parse(JSON.stringify(doc)) as OrderDTO;
}

/** Order the signed-in user owns, or null. */
export async function getOwnedOrder(reference: string): Promise<OrderDTO | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  await connectDB();
  const doc = await Order.findOne({ reference, user: userId }).lean();
  return doc ? toOrderDTO(doc) : null;
}

/** Confirmation page access: the owner, or the browser that just placed the order (guest checkout). */
export async function getOrderForConfirmation(reference: string): Promise<OrderDTO | null> {
  const owned = await getOwnedOrder(reference);
  if (owned) return owned;
  const last = (await cookies()).get(LAST_ORDER_COOKIE)?.value;
  if (last !== reference) return null;
  await connectDB();
  const doc = await Order.findOne({ reference }).lean();
  return doc ? toOrderDTO(doc) : null;
}

export async function listOwnedOrders(opts: { q?: string; status?: string }): Promise<OrderDTO[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];
  await connectDB();
  const filter: Record<string, unknown> = { user: userId };
  if (opts.status && ["confirmed", "preparing", "dispatched", "delivered"].includes(opts.status)) {
    filter.status = opts.status;
  }
  if (opts.q) {
    const escaped = opts.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 40);
    filter.reference = { $regex: escaped, $options: "i" };
  }
  const docs = await Order.find(filter).sort({ createdAt: -1 }).lean();
  return docs.map(toOrderDTO);
}
