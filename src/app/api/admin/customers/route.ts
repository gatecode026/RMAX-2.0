import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { QuoteRequest } from "@/models/QuoteRequest";
import { Order } from "@/models/Order";
import { getSessionUser } from "@/lib/session";
import { checkApiPermission } from "@/lib/permissions-server";
import { logAction } from "@/lib/audit";

export async function GET() {
  try {
    const auth = await checkApiPermission("customersView");
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await connectDB();

    // Query all customers (users who are not super_admin or manager)
    const dbUsers = await User.find({
      email: { $nin: ["mukesh@rmaxelectro.com", "rmaxadmin@gmail.com", "rmaxmanager@gmail.com"] },
      role: { $nin: ["super_admin", "admin", "manager"] },
    })
      .select("name email phone organization department createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    // Only the fields the list needs, grouped once by email (was: whole documents, re-scanned per customer).
    const [allQuotes, allOrders] = await Promise.all([
      QuoteRequest.find().select("email contactPerson organizationName institutionType phone quotedAmount createdAt updatedAt").lean(),
      Order.find().select("contact.email total").lean(),
    ]);
    const quotesByEmail = new Map<string, typeof allQuotes>();
    for (const q of allQuotes) {
      const k = q.email?.toLowerCase();
      if (k) (quotesByEmail.get(k) ?? quotesByEmail.set(k, []).get(k)!).push(q);
    }
    const ordersByEmail = new Map<string, typeof allOrders>();
    for (const o of allOrders) {
      const k = o.contact?.email?.toLowerCase();
      if (k) (ordersByEmail.get(k) ?? ordersByEmail.set(k, []).get(k)!).push(o);
    }

    // Build unique customer list
    const customerMap = new Map<string, any>();

    // Add registered users
    for (const u of dbUsers) {
      const email = u.email.toLowerCase();
      const userQuotes = quotesByEmail.get(email) ?? [];
      const userOrders = ordersByEmail.get(email) ?? [];
      const ordersCount = userQuotes.length + userOrders.length;
      const totalSpent =
        userQuotes.reduce((acc, q) => acc + (q.quotedAmount || 0), 0) +
        userOrders.reduce((acc, o) => acc + (o.total || 0), 0);

      const initials = (u.name || "Customer")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      customerMap.set(email, {
        id: String(u._id),
        name: u.name || "Customer",
        initials: initials || "CU",
        organization: u.organization || "Direct Client",
        type: u.department || "Individual",
        email: u.email,
        phone: u.phone || "—",
        ordersCount,
        totalSpent,
        lastActiveAt: new Date(u.updatedAt || u.createdAt || Date.now()).toISOString(),
        registered: true,
        lastActive: new Date(u.updatedAt || u.createdAt || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      });
    }

    // Add any quotation contacts who aren't yet registered users
    for (const q of allQuotes) {
      const email = q.email?.toLowerCase();
      if (!email || customerMap.has(email)) continue;

      const sameEmailQuotes = quotesByEmail.get(email) ?? [];
      const ordersCount = sameEmailQuotes.length;
      const totalSpent = sameEmailQuotes.reduce((acc, item) => acc + (item.quotedAmount || 0), 0);
      const initials = (q.contactPerson || q.organizationName || "Client")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      customerMap.set(email, {
        id: `quote-client-${String(q._id)}`,
        name: q.contactPerson || "Institutional Buyer",
        initials: initials || "IB",
        organization: q.organizationName || "Institutional Facility",
        type: q.institutionType || "School",
        email: q.email,
        phone: q.phone || "—",
        ordersCount,
        totalSpent,
        lastActiveAt: new Date(q.updatedAt || q.createdAt || Date.now()).toISOString(),
        registered: false,
        lastActive: new Date(q.updatedAt || q.createdAt || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      });
    }

    const customers = Array.from(customerMap.values());

    return NextResponse.json({ success: true, customers });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load customers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser("staff");
    if (!user || (user.role !== "super_admin" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Only Super Admin can create customers" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, organization, type } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 });
    }

    await connectDB();

    // Scoped to the customer identity namespace: this email/phone may already belong to an
    // Admin or Manager account, which is allowed by design and must not block creating a
    // Customer record for the same person.
    const existing = await User.findOne({ email: email.toLowerCase(), role: "customer" });
    if (existing) {
      return NextResponse.json({ success: false, error: "Customer with this email already exists" }, { status: 400 });
    }

    if (phone) {
      const cleanDigits = phone.replace(/\D/g, "").slice(-10);
      const existingPhone = await User.findOne({
        role: "customer",
        $or: [
          { phone: cleanDigits },
          { phone },
          { phone: `+91${cleanDigits}` },
          { phone: `0${cleanDigits}` },
        ],
      }).lean();
      if (existingPhone) {
        return NextResponse.json({ success: false, error: "A user with this mobile number already exists" }, { status: 400 });
      }
    }

    const bcrypt = await import("bcryptjs");
    const tempPassword = `Cust@${Math.random().toString(36).slice(-8)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newCustomer = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      organization: organization || "",
      role: "customer",
      status: "active",
      passwordHash,
    });

    await logAction({
      actor: user,
      action: "user_created",
      entityType: "user",
      entityId: String(newCustomer._id),
      details: `Created customer account for ${name} (${email})`,
    });

    return NextResponse.json({ success: true, customer: newCustomer }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to create customer" },
      { status: 500 }
    );
  }
}
