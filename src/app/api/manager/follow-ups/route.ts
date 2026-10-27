import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import { checkApiRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const authResult = await checkApiRole(["manager", "super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;
    const isSuperAdmin = user.role === "super_admin" || user.role === "admin";

    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const baseQuery: Record<string, unknown> = {
      isArchived: false,
      status: { $nin: ["converted", "lost"] },
      nextFollowUpAt: { $ne: null },
    };

    if (!isSuperAdmin) {
      baseQuery.assignedManager = user.id;
    }

    const [overdue, dueToday, upcoming] = await Promise.all([
      Lead.find({
        ...baseQuery,
        nextFollowUpAt: { $lt: startOfToday },
      })
        .sort({ nextFollowUpAt: 1 })
        .limit(50)
        .lean(),

      Lead.find({
        ...baseQuery,
        nextFollowUpAt: { $gte: startOfToday, $lte: endOfToday },
      })
        .sort({ nextFollowUpAt: 1 })
        .limit(50)
        .lean(),

      Lead.find({
        ...baseQuery,
        nextFollowUpAt: { $gt: endOfToday },
      })
        .sort({ nextFollowUpAt: 1 })
        .limit(50)
        .lean(),
    ]);

    const formatLead = (l: typeof overdue[0]) => ({
      id: String(l._id),
      leadNumber: l.leadNumber,
      name: l.name,
      institution: l.institution,
      phone: l.phone,
      email: l.email,
      status: l.status,
      priority: l.priority,
      assignedManagerName: l.assignedManagerName || "Unassigned",
      preferredModel: l.preferredModel,
      quantity: l.quantity,
      estimatedValue: l.estimatedValue,
      nextFollowUpAt: l.nextFollowUpAt,
      lastContactedAt: l.lastContactedAt,
    });

    return NextResponse.json({
      counts: {
        overdue: overdue.length,
        dueToday: dueToday.length,
        upcoming: upcoming.length,
      },
      overdue: overdue.map(formatLead),
      dueToday: dueToday.map(formatLead),
      upcoming: upcoming.map(formatLead),
    });
  } catch (error) {
    console.error("Follow-ups GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
