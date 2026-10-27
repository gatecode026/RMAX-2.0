import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin", "manager"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const { id } = await params;

    await connectDB();
    const lead = await Lead.findById(id).lean();

    if (!lead || lead.isArchived) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Role sandbox: Manager can only inspect their own assigned leads
    const isSuperAdmin = user.role === "super_admin" || user.role === "admin";
    if (!isSuperAdmin && String(lead.assignedManager) !== user.id) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to view this lead" }, { status: 403 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Lead GET by ID error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin", "manager"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const isSuperAdmin = user.role === "super_admin" || user.role === "admin";
    const { id } = await params;

    await connectDB();
    const lead = await Lead.findById(id);

    if (!lead || lead.isArchived) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Strict manager check: Manager can only update their own assigned leads
    if (!isSuperAdmin && String(lead.assignedManager) !== user.id) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to modify this lead" }, { status: 403 });
    }

    const body = await req.json();
    const {
      status,
      priority,
      assignedManagerId,
      action,
      notes,
      callDuration,
      callOutcome,
      nextFollowUpAt,
    } = body;

    const previousStatus = lead.status;
    const previousManagerId = lead.assignedManager ? String(lead.assignedManager) : null;
    const previousManagerName = lead.assignedManagerName;

    // 1. Reassignment: SUPER ADMIN ONLY
    if (assignedManagerId !== undefined) {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { error: "Forbidden: Only Super Admins can reassign leads to another manager" },
          { status: 403 },
        );
      }

      if (assignedManagerId === null || assignedManagerId === "") {
        lead.assignedManager = null;
        lead.assignedManagerName = null;
        lead.assignedAt = null;
        lead.activities.push({
          type: "assignment",
          description: `Unassigned by ${user.name}`,
          performedBy: user.id as unknown as import("mongoose").Types.ObjectId,
          performedByName: user.name || "Super Admin",
          createdAt: new Date(),
        });
      } else {
        const newManager = await User.findById(assignedManagerId).lean();
        if (!newManager || (newManager.role !== "manager" && newManager.role !== "super_admin" && newManager.role !== "admin")) {
          return NextResponse.json({ error: "Invalid manager selected" }, { status: 400 });
        }

        lead.assignedManager = newManager._id;
        lead.assignedManagerName = newManager.name;
        lead.assignedAt = new Date();
        lead.assignedBy = user.id as unknown as import("mongoose").Types.ObjectId;

        if (lead.status === "new") {
          lead.status = "assigned";
        }

        lead.activities.push({
          type: "assignment",
          description: `Assigned to ${newManager.name} by ${user.name}`,
          performedBy: user.id as unknown as import("mongoose").Types.ObjectId,
          performedByName: user.name || "Super Admin",
          createdAt: new Date(),
        });

        // Notify new manager
        await createNotification({
          recipientId: String(newManager._id),
          targetRole: "manager",
          title: "Lead Assigned to You",
          message: `${lead.name} (${lead.institution}) reassigned by ${user.name}`,
          type: "lead_assigned",
          entityType: "lead",
          entityId: String(lead._id),
          link: `/manager/leads/${lead._id}`,
        });

        // Notify previous manager if reassigned away
        if (previousManagerId && previousManagerId !== String(newManager._id)) {
          await createNotification({
            recipientId: previousManagerId,
            targetRole: "manager",
            title: "Lead Reassigned Away",
            message: `${lead.name} (${lead.institution}) reassigned to ${newManager.name}`,
            type: "lead_reassigned",
            entityType: "lead",
            entityId: String(lead._id),
            link: `/manager/leads`,
          });
        }
      }
    }

    // 2. Status update
    if (status && status !== previousStatus) {
      lead.status = status;
      lead.activities.push({
        type: "status_change",
        description: `Status changed from "${previousStatus.toUpperCase()}" to "${status.toUpperCase()}"`,
        performedBy: user.id as unknown as import("mongoose").Types.ObjectId,
        performedByName: user.name || user.email || "User",
        createdAt: new Date(),
      });

      // If converted or lost, notify Super Admin
      if (status === "converted" || status === "lost") {
        await createNotification({
          targetRole: "super_admin",
          title: `Lead Marked as ${status.toUpperCase()}`,
          message: `${lead.name} from ${lead.institution} was marked ${status} by ${user.name}`,
          type: "lead_status_changed",
          entityType: "lead",
          entityId: String(lead._id),
          link: `/admin/leads`,
        });
      }
    }

    // 3. Priority update
    if (priority && priority !== lead.priority) {
      lead.priority = priority;
      lead.activities.push({
        type: "note",
        description: `Priority updated to ${priority.toUpperCase()}`,
        performedBy: user.id as unknown as import("mongoose").Types.ObjectId,
        performedByName: user.name || "User",
        createdAt: new Date(),
      });
    }

    // 4. Record Call action
    if (action === "record_call") {
      lead.lastContactedAt = new Date();
      lead.activities.push({
        type: "call",
        description: `Call recorded: ${callOutcome || "Connected"}. ${notes || ""}`,
        metadata: { callDuration, callOutcome, notes },
        performedBy: user.id as unknown as import("mongoose").Types.ObjectId,
        performedByName: user.name || "Manager",
        createdAt: new Date(),
      });
    }

    // 5. Add Note action
    if (action === "add_note" && notes?.trim()) {
      lead.activities.push({
        type: "note",
        description: notes.trim(),
        performedBy: user.id as unknown as import("mongoose").Types.ObjectId,
        performedByName: user.name || "User",
        createdAt: new Date(),
      });
    }

    // 6. Schedule Next Follow-up
    if (nextFollowUpAt !== undefined) {
      lead.nextFollowUpAt = nextFollowUpAt ? new Date(nextFollowUpAt) : null;
      if (nextFollowUpAt) {
        lead.activities.push({
          type: "followup_scheduled",
          description: `Follow-up scheduled for ${new Date(nextFollowUpAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          performedBy: user.id as unknown as import("mongoose").Types.ObjectId,
          performedByName: user.name || "User",
          createdAt: new Date(),
        });
      }
    }

    await lead.save();

    // Log audit event
    await logAuditEvent({
      actor: user,
      action: "LEAD_UPDATED",
      entityType: "lead",
      entityId: String(lead._id),
      metadata: {
        leadNumber: lead.leadNumber,
        statusChanged: status !== previousStatus ? { from: previousStatus, to: status } : null,
        reassigned: assignedManagerId !== undefined ? { from: previousManagerName, to: lead.assignedManagerName } : null,
        action,
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Lead PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const { id } = await params;

    await connectDB();
    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Soft delete / archive
    lead.isArchived = true;
    lead.activities.push({
      type: "status_change",
      description: `Lead archived by Super Admin ${user.name}`,
      performedBy: user.id as unknown as import("mongoose").Types.ObjectId,
      performedByName: user.name || "Super Admin",
      createdAt: new Date(),
    });
    await lead.save();

    await logAuditEvent({
      actor: user,
      action: "LEAD_ARCHIVED",
      entityType: "lead",
      entityId: String(lead._id),
      metadata: { leadNumber: lead.leadNumber, name: lead.name },
    });

    return NextResponse.json({ success: true, message: "Lead archived successfully" });
  } catch (error) {
    console.error("Lead DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
