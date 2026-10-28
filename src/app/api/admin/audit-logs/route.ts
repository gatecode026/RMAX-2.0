import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AuditLog } from "@/models/AuditLog";
import { checkApiRole } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const authResult = await checkApiRole(["super_admin", "admin"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "30", 10)), 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    const entityType = searchParams.get("entityType");
    if (entityType && entityType !== "all") {
      query.entityType = entityType;
    }

    const action = searchParams.get("action");
    if (action && action !== "all") {
      query.action = action;
    }

    const search = searchParams.get("search");
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ actorName: regex }, { action: regex }, { entityId: regex }];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: String(l._id),
        actorName: l.actorName,
        actorEmail: l.actorEmail,
        actorRole: l.actorRole,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadata: l.metadata,
        timestamp: l.timestamp,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Audit log GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
