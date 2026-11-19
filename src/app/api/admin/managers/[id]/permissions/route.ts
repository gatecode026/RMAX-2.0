import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { PERMISSION_KEYS, normalizePermissions } from "@/lib/permissions";
import { getManagerPermissions, publishPermissionChange } from "@/lib/permissions-server";

const isObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

/** GET /api/admin/managers/:id/permissions — a manager's effective permissions. Admin only. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkApiRole(["super_admin", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  if (!isObjectId(id)) return NextResponse.json({ error: "Manager account not found" }, { status: 404 });
  await connectDB();
  const manager = await User.findOne({ _id: id, role: "manager" }).select("name email").lean();
  if (!manager) return NextResponse.json({ error: "Manager account not found" }, { status: 404 });
  return NextResponse.json({ success: true, permissions: await getManagerPermissions(id) });
}

/** PUT /api/admin/managers/:id/permissions — replace a manager's permissions. Admin only. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkApiRole(["super_admin", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { user } = auth;
  const { id } = await params;
  if (!isObjectId(id)) return NextResponse.json({ error: "Manager account not found" }, { status: 404 });

  let body: { permissions?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const incoming = body.permissions;
  if (!incoming || typeof incoming !== "object" || PERMISSION_KEYS.some((k) => typeof incoming[k] !== "boolean")) {
    return NextResponse.json({ error: "permissions must include every switch as true or false" }, { status: 422 });
  }

  await connectDB();
  const manager = await User.findOne({ _id: id, role: "manager" }).select("name email").lean();
  if (!manager) return NextResponse.json({ error: "Manager account not found" }, { status: 404 });

  // Normalising here means an action can never be saved as on while its page is off.
  const permissions = normalizePermissions(incoming);
  await User.updateOne({ _id: id }, { $set: { permissions } });

  await logAuditEvent({
    actor: user,
    action: "MANAGER_PERMISSIONS_UPDATED",
    entityType: "manager",
    entityId: id,
    metadata: { permissions, details: `${user.name} updated page permissions for manager ${manager.name} (${manager.email})` },
  });

  publishPermissionChange(id, permissions);
  return NextResponse.json({ success: true, permissions });
}
