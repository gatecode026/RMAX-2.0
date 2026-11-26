import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { checkApiRole } from "@/lib/session";
import { ORDER_STATUSES } from "@/lib/enums";

/** Admin: paged list of customer orders (separate from quotations). */
export async function GET(req: NextRequest) {
  try {
    const auth = await checkApiRole(["super_admin", "admin"]);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    await connectDB();

    const sp = new URL(req.url).searchParams;
    const search = sp.get("search")?.trim() || "";
    const status = sp.get("status")?.trim() || "all";
    const query: Record<string, unknown> = {};
    if ((ORDER_STATUSES as readonly string[]).includes(status)) query.status = status;
    if (search) {
      const rx = { $regex: search.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      query.$or = [{ reference: rx }, { "contact.fullName": rx }, { "contact.email": rx }, { "contact.phone": rx }, { "shippingAddress.organization": rx }];
    }

    const pageSize = Math.min(100, Math.max(1, parseInt(sp.get("pageSize") || "25", 10) || 25));
    const total = await Order.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(totalPages, Math.max(1, parseInt(sp.get("page") || "1", 10) || 1));
    const orders = await Order.find(query).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean();
    // Per-status totals for the filter chips (ignores the status filter itself).
    const counts = await Order.aggregate([{ $match: search ? { $or: query.$or as object[] } : {} }, { $group: { _id: "$status", n: { $sum: 1 } } }]);

    return NextResponse.json({ orders, total, page, pageSize, totalPages, counts: Object.fromEntries(counts.map((c) => [c._id, c.n])) });
  } catch (err) {
    unstable_rethrow(err); // let Next prerender signals through
    console.error("GET /api/admin/orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
