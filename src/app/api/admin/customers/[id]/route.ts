import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkApiPermission } from "@/lib/permissions-server";
import { logAction } from "@/lib/audit";

const isObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
const TYPES = ["School", "Hospital", "College", "Workplace", "Individual"];

/**
 * PATCH /api/admin/customers/:id — edit a registered customer (name, phone, organization, type).
 * Admins, or managers with "Edit customer". Quote-only contacts (ids starting "quote-client-")
 * are not accounts and cannot be edited here.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkApiPermission("customersEdit");
  if ("error" in auth) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  const { id } = await params;
  if (!isObjectId(id)) {
    return NextResponse.json({ success: false, error: "Only registered customer accounts can be edited." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const fields: Record<string, string> = {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 100) fields.name = "Enter the customer's name (2–100 characters).";
  const organization = typeof body.organization === "string" ? body.organization.trim().slice(0, 150) : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  if (type && !TYPES.includes(type)) fields.type = "Choose a valid customer type.";
  let phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (phone) {
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) fields.phone = "Enter a valid 10-digit mobile number.";
    else phone = digits;
  }
  if (Object.keys(fields).length) {
    return NextResponse.json({ success: false, error: "Please check the highlighted fields.", fields }, { status: 422 });
  }

  await connectDB();
  const customer = await User.findOne({ _id: id, role: "customer" });
  if (!customer) return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });

  if (phone) {
    const clash = await User.findOne({ _id: { $ne: id }, role: "customer", phone }).select("_id").lean();
    if (clash) {
      return NextResponse.json(
        { success: false, error: "A customer with this mobile number already exists.", fields: { phone: "Already used by another customer." } },
        { status: 409 },
      );
    }
  }

  customer.name = name;
  customer.organization = organization;
  customer.phone = phone;
  if (type) customer.department = type;
  await customer.save();

  await logAction({
    actor: auth.user,
    action: "customer_updated",
    entityType: "user",
    entityId: id,
    details: `${auth.user.name} (${auth.user.role}) edited customer ${customer.email}`,
  });

  return NextResponse.json({
    success: true,
    customer: {
      id,
      name: customer.name,
      initials: customer.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "CU",
      organization: customer.organization || "Direct Client",
      type: customer.department || "Individual",
      email: customer.email,
      phone: customer.phone || "—",
    },
  });
}
