import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import { checkApiPermission } from "@/lib/permissions-server";

/**
 * GET /api/manager/dashboard-summary — exactly what the manager dashboard renders: pipeline counts and
 * the short follow-up lists. Needs only the Dashboard permission, so a dashboard-only manager never
 * has to touch the lead list/detail APIs (those need Lead Management). Scope is the same as the
 * lead list: the manager's own leads plus unassigned ones. Contact details (phone, email) are
 * included only when the manager also holds Lead Management view.
 */
export async function GET() {
  const auth = await checkApiPermission("dashboardView");
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { user, isAdmin, permissions } = auth;
  const canSeeContacts = isAdmin || permissions.leadsView;

  await connectDB();
  const scope: Record<string, unknown> = { isArchived: false };
  if (!isAdmin) scope.$or = [{ assignedManager: new Types.ObjectId(user.id) }, { assignedManager: null }, { assignedManager: { $exists: false } }];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const open: Record<string, unknown> = { ...scope, status: { $nin: ["converted", "lost"] }, nextFollowUpAt: { $ne: null } };

  const list = (q: Record<string, unknown>) =>
    Lead.find(q).select("leadNumber name institution status priority nextFollowUpAt phone").sort({ nextFollowUpAt: 1, _id: 1 }).limit(10).lean();
  const [byStatus, overdueCount, dueTodayCount, overdue, dueToday, upcoming] = await Promise.all([
    Lead.aggregate([{ $match: scope }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Lead.countDocuments({ ...open, nextFollowUpAt: { $lt: startOfToday } }),
    Lead.countDocuments({ ...open, nextFollowUpAt: { $gte: startOfToday, $lte: endOfToday } }),
    list({ ...open, nextFollowUpAt: { $lt: startOfToday } }),
    list({ ...open, nextFollowUpAt: { $gte: startOfToday, $lte: endOfToday } }),
    list({ ...open, nextFollowUpAt: { $gt: endOfToday } }),
  ]);

  const counts: Record<string, number> = {};
  let totalAssigned = 0;
  for (const c of byStatus) {
    counts[c._id] = c.count;
    totalAssigned += c.count;
  }
  const item = (l: (typeof overdue)[number]) => ({
    id: String(l._id),
    leadNumber: l.leadNumber,
    name: l.name,
    institutionName: l.institution,
    status: l.status,
    priority: l.priority,
    nextFollowUpAt: l.nextFollowUpAt,
    ...(canSeeContacts ? { phone: l.phone } : {}),
  });

  return NextResponse.json({
    stats: {
      totalAssigned,
      newLeads: counts.new ?? 0,
      contacted: counts.contacted ?? 0,
      qualified: counts.qualified ?? 0,
      converted: counts.converted ?? 0,
      lost: counts.lost ?? 0,
      dueToday: dueTodayCount,
      overdue: overdueCount,
    },
    overdue: overdue.map(item),
    dueToday: dueToday.map(item),
    upcoming: upcoming.map(item),
  });
}
