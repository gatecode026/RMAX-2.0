import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user: currentAdmin } = authResult;
    const { id } = await params;

    await connectDB();
    const manager = await User.findById(id);

    if (!manager || (manager.role !== "manager" && manager.role !== "admin" && manager.role !== "super_admin")) {
      return NextResponse.json({ error: "Manager account not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status, name, phone, department, newPassword } = body;

    const updates: Record<string, unknown> = {};

    if (status && (status === "active" || status === "inactive")) {
      updates.status = status;
      manager.status = status;
    }

    if (name?.trim()) {
      updates.name = name.trim();
      manager.name = name.trim();
    }

    if (phone !== undefined) {
      updates.phone = phone.trim();
      manager.phone = phone.trim();
    }

    if (department !== undefined) {
      updates.department = department.trim();
      manager.department = department.trim();
    }

    if (newPassword && newPassword.length >= 6) {
      manager.passwordHash = await bcrypt.hash(newPassword, 10);
      updates.passwordReset = true;
    }

    await manager.save();

    await logAuditEvent({
      actor: currentAdmin,
      action: status ? `MANAGER_STATUS_${status.toUpperCase()}` : "MANAGER_UPDATED",
      entityType: "manager",
      entityId: String(manager._id),
      metadata: { name: manager.name, email: manager.email, ...updates },
    });

    if (status) {
      await createNotification({
        targetRole: "super_admin",
        title: `Manager ${status === "active" ? "Activated" : "Deactivated"}`,
        message: `${manager.name} (${manager.email}) status was changed to ${status}`,
        type: "manager_action",
        entityType: "user",
        entityId: String(manager._id),
        link: `/admin/users`,
      });
    }

    return NextResponse.json({
      success: true,
      manager: {
        id: String(manager._id),
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        department: manager.department,
        status: manager.status,
      },
    });
  } catch (error) {
    console.error("Manager update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user: currentAdmin } = authResult;
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: "Manager ID is required" }, { status: 400 });
    }

    await connectDB();
    const manager = await User.findById(id);

    if (!manager) {
      return NextResponse.json({ error: "Manager account not found" }, { status: 404 });
    }

    if (manager.role !== "manager") {
      return NextResponse.json(
        { error: "Only manager accounts can be deleted from this portal" },
        { status: 400 }
      );
    }

    // Safely unassign leads previously assigned to this manager
    try {
      const { Lead } = await import("@/models/Lead");
      await Lead.updateMany(
        { assignedManager: manager._id },
        { $unset: { assignedManager: 1, assignedManagerName: 1 } }
      );
    } catch (leadErr) {
      console.warn("Could not unassign leads for manager:", leadErr);
    }

    // Delete manager user
    await User.findByIdAndDelete(id);

    // Safely log audit event without throwing
    try {
      await logAuditEvent({
        actor: currentAdmin,
        action: "MANAGER_DELETED",
        entityType: "manager",
        entityId: String(id),
        metadata: { name: manager.name, email: manager.email, department: manager.department },
      });
    } catch (auditErr) {
      console.warn("Audit log failed during manager delete:", auditErr);
    }

    // Safely create super_admin notification without throwing
    try {
      await createNotification({
        targetRole: "super_admin",
        title: "Manager Account Deleted",
        message: `${manager.name} (${manager.email}) was removed from the manager team`,
        type: "manager_action",
        entityType: "user",
        entityId: String(id),
        link: `/admin/users`,
      });
    } catch (notifErr) {
      console.warn("Notification failed during manager delete:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: `Manager ${manager.name} was successfully removed.`,
    });
  } catch (error: any) {
    console.error("Manager deletion error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete manager account." },
      { status: 500 }
    );
  }
}
