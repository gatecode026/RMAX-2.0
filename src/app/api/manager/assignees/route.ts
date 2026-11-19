import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkApiPermission } from "@/lib/permissions-server";

/** GET /api/manager/assignees — users a lead may be assigned to (same set the lead PATCH accepts). Needs "Assign / reassign lead". */
export async function GET() {
  const auth = await checkApiPermission("leadsAssign");
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectDB();
  const users = await User.find({ role: { $in: ["manager", "admin", "super_admin"] }, status: { $ne: "inactive" } })
    .select("name role")
    .sort({ name: 1 })
    .lean();
  return NextResponse.json({ success: true, assignees: users.map((u) => ({ id: String(u._id), name: u.name, role: u.role })) });
}
