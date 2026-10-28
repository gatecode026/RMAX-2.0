import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";
import { Counter } from "@/models/Counter";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin", "manager"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    await connectDB();
    const { searchParams } = new URL(req.url);

    const isSuperAdmin = user.role === "super_admin" || user.role === "admin";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "25", 10)), 100);
    const skip = (page - 1) * limit;

    const andConditions: any[] = [{ isArchived: false }];

    // Manager sees both their assigned leads and live unassigned website leads
    if (!isSuperAdmin) {
      andConditions.push({
        $or: [
          { assignedManager: user.id },
          { assignedManager: null },
          { assignedManager: { $exists: false } },
        ],
      });
    } else {
      // Super Admin filters
      const managerId = searchParams.get("managerId");
      if (managerId === "unassigned") {
        andConditions.push({ assignedManager: null });
      } else if (managerId && managerId !== "all") {
        andConditions.push({ assignedManager: managerId });
      }
    }

    // Common filters
    const status = searchParams.get("status");
    if (status && status !== "all") {
      andConditions.push({ status });
    }

    const priority = searchParams.get("priority");
    if (priority && priority !== "all") {
      andConditions.push({ priority });
    }

    const source = searchParams.get("source");
    if (source && source !== "all") {
      andConditions.push({ source });
    }

    const search = searchParams.get("search");
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      andConditions.push({
        $or: [
          { name: regex },
          { institution: regex },
          { email: regex },
          { phone: regex },
          { leadNumber: regex },
          { city: regex },
        ],
      });
    }

    const query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0] || {};
    const managerMatch = {
      isArchived: false,
      $or: [
        { assignedManager: user.id },
        { assignedManager: null },
        { assignedManager: { $exists: false } },
      ],
    };

    const [leads, total, counts] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(query),
      // Aggregate status counts for dashboard stats
      Lead.aggregate([
        { $match: isSuperAdmin ? { isArchived: false } : managerMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const statusCounts: Record<string, number> = {
      all: 0,
      new: 0,
      assigned: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      lost: 0,
    };

    counts.forEach((c) => {
      if (c._id in statusCounts) {
        statusCounts[c._id] = c.count;
      }
      statusCounts.all += c.count;
    });

    return NextResponse.json({
      leads: leads.map((l) => ({
        id: String(l._id),
        leadNumber: l.leadNumber,
        name: l.name,
        institution: l.institution,
        institutionType: l.institutionType,
        email: l.email,
        phone: l.phone,
        source: l.source,
        status: l.status,
        priority: l.priority,
        assignedManager: l.assignedManager ? String(l.assignedManager) : null,
        assignedManagerName: l.assignedManagerName || "Unassigned",
        preferredModel: l.preferredModel,
        quantity: l.quantity,
        estimatedValue: l.estimatedValue,
        city: l.city,
        state: l.state,
        lastContactedAt: l.lastContactedAt,
        nextFollowUpAt: l.nextFollowUpAt,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts,
    });
  } catch (error) {
    console.error("Leads GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin", "manager"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const isSuperAdmin = user.role === "super_admin" || user.role === "admin";

    await connectDB();
    const body = await req.json();

    const {
      name,
      institution,
      institutionType,
      email,
      phone,
      source = "manual",
      priority = "medium",
      preferredModel = "pro",
      quantity = 1,
      estimatedValue = 0,
      city,
      state,
      notes,
      assignedManagerId,
      nextFollowUpAt,
    } = body;

    if (!name?.trim() || !institution?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name, institution, email, and phone are required" }, { status: 400 });
    }

    // Check for duplicate leads warning
    const duplicate = await Lead.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }],
      isArchived: false,
    }).lean();

    // Generate consecutive leadNumber (e.g., LD-1001)
    const counter = await Counter.findByIdAndUpdate(
      "leadNumber",
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    const seq = (counter?.seq || 1) + 1000;
    const leadNumber = `LD-${seq}`;

    let assignedManager = null;
    let assignedManagerName = null;

    // Super Admin can assign immediately to any manager.
    // Managers creating leads can assign to themselves.
    if (isSuperAdmin && assignedManagerId) {
      const mgr = await User.findById(assignedManagerId).lean();
      if (mgr && (mgr.role === "manager" || mgr.role === "super_admin" || mgr.role === "admin")) {
        assignedManager = mgr._id;
        assignedManagerName = mgr.name;
      }
    } else if (!isSuperAdmin) {
      assignedManager = user.id;
      assignedManagerName = user.name || "Assigned Manager";
    }

    const initialStatus = assignedManager ? "assigned" : "new";

    const lead = await Lead.create({
      leadNumber,
      name: name.trim(),
      institution: institution.trim(),
      institutionType: institutionType || "Other",
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      source,
      status: initialStatus,
      priority,
      assignedManager,
      assignedManagerName,
      assignedAt: assignedManager ? new Date() : null,
      assignedBy: user.id,
      createdBy: user.id,
      preferredModel,
      quantity: Number(quantity) || 1,
      estimatedValue: Number(estimatedValue) || 0,
      city: city?.trim(),
      state: state?.trim(),
      notes: notes?.trim(),
      nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,
      isDuplicateWarning: Boolean(duplicate),
      activities: [
        {
          type: "status_change",
          description: `Lead created from ${source}`,
          performedBy: user.id,
          performedByName: user.name || user.email || "System",
          createdAt: new Date(),
        },
        ...(assignedManager
          ? [
              {
                type: "assignment" as const,
                description: `Assigned to ${assignedManagerName}`,
                performedBy: user.id,
                performedByName: user.name || user.email || "System",
                createdAt: new Date(),
              },
            ]
          : []),
      ],
    });

    // Notify both managers and super admins
    await createNotification({
      targetRole: "all",
      title: assignedManager ? `New Lead Assigned: ${leadNumber}` : `New Lead Created: ${leadNumber}`,
      message: `${name} (${institution}) • Mobile: ${phone} • ${priority.toUpperCase()} Priority${assignedManagerName ? ` • Assigned to ${assignedManagerName}` : " • Unassigned"}`,
      type: assignedManager ? "lead_assigned" : "lead_created",
      entityType: "lead",
      entityId: String(lead._id),
      link: "/admin/leads",
    });

    // Log audit event
    await logAuditEvent({
      actor: user,
      action: "LEAD_CREATED",
      entityType: "lead",
      entityId: String(lead._id),
      metadata: { leadNumber, name, institution, assignedManagerName, priority },
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
