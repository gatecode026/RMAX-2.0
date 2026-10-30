import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Lead } from "@/models/Lead";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const managers = await User.find({ role: "manager" })
      .select("name email phone department status lastLoginAt createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate lead performance stats per manager
    const leadStats = await Lead.aggregate([
      { $match: { isArchived: false, assignedManager: { $ne: null } } },
      {
        $group: {
          _id: "$assignedManager",
          totalAssigned: { $sum: 1 },
          contacted: { $sum: { $cond: [{ $in: ["$status", ["contacted", "qualified", "converted"]] }, 1, 0] } },
          converted: { $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] } },
        },
      },
    ]);

    const statsMap = new Map(leadStats.map((s) => [String(s._id), s]));

    const result = managers.map((m) => {
      const stats = statsMap.get(String(m._id)) || { totalAssigned: 0, contacted: 0, converted: 0 };
      const convRate = stats.totalAssigned > 0 ? Math.round((stats.converted / stats.totalAssigned) * 100) : 0;
      return {
        _id: String(m._id),
        id: String(m._id),
        name: m.name,
        email: m.email,
        role: "manager",
        phone: m.phone || "Not set",
        department: m.department || "Sales & Institutional",
        status: m.status || "active",
        lastLoginAt: m.lastLoginAt,
        createdAt: m.createdAt,
        assignedLeadsCount: stats.totalAssigned,
        convertedLeadsCount: stats.converted,
        totalAssigned: stats.totalAssigned,
        contacted: stats.contacted,
        converted: stats.converted,
        conversionRate: convRate,
      };
    });

    return NextResponse.json({ managers: result });
  } catch (error) {
    console.error("Managers GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user: currentAdmin } = authResult;

    await connectDB();
    const body = await req.json();
    const { name, email, password, phone, department = "Institutional Sales" } = body;

    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Name, email, and a password of at least 6 characters are required" },
        { status: 400 },
      );
    }

    // Scoped to the Manager identity namespace only: the same email (or phone) may already
    // belong to an Admin or Customer account — that's the whole point of the shared-identity
    // model (same person, independent Admin/Manager/Customer logins with separate passwords).
    // Only a second *Manager* account with this email is rejected as a true duplicate.
    const existing = await User.findOne({ email: email.toLowerCase().trim(), role: "manager" }).lean();
    if (existing) {
      return NextResponse.json({ error: "A manager account with this email address already exists" }, { status: 409 });
    }

    if (phone?.trim()) {
      const cleanDigits = phone.replace(/\D/g, "").slice(-10);
      const existingPhone = await User.findOne({
        role: "manager",
        $or: [
          { phone: cleanDigits },
          { phone: phone.trim() },
          { phone: `+91${cleanDigits}` },
          { phone: `0${cleanDigits}` },
        ],
      }).lean();
      if (existingPhone) {
        return NextResponse.json({ error: "A manager account with this mobile number already exists" }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newManager = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "manager",
      status: "active",
      phone: phone?.trim(),
      department: department?.trim(),
      billingSameAsShipping: true,
    });

    await logAuditEvent({
      actor: currentAdmin,
      action: "MANAGER_CREATED",
      entityType: "manager",
      entityId: String(newManager._id),
      metadata: { name: newManager.name, email: newManager.email, department },
    });

    await createNotification({
      targetRole: "super_admin",
      title: "Manager Account Created",
      message: `${newManager.name} (${newManager.email}) was onboarded as a Lead Manager`,
      type: "manager_action",
      entityType: "user",
      entityId: String(newManager._id),
      link: `/admin/users`,
    });

    return NextResponse.json(
      {
        success: true,
        manager: {
          id: String(newManager._id),
          name: newManager.name,
          email: newManager.email,
          phone: newManager.phone,
          department: newManager.department,
          status: newManager.status,
          createdAt: newManager.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Manager creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user: currentAdmin } = authResult;

    let id: string | null = null;
    const { searchParams } = new URL(req.url);
    id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body?.id || body?.managerId;
    }

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
      await Lead.updateMany(
        { assignedManager: manager._id },
        { $unset: { assignedManager: 1, assignedManagerName: 1 } }
      );
    } catch (leadErr) {
      console.warn("Could not unassign leads for manager:", leadErr);
    }

    // Delete manager user
    await User.findByIdAndDelete(id);

    // Safely log audit event
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

    // Safely create notification
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
