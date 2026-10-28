import { connectDB } from "@/lib/mongodb";
import { AuditLog } from "@/models/AuditLog";
import type { SessionUser } from "@/lib/session";

interface LogActionParams {
  actor?: SessionUser | null;
  action: string;
  entityType: "lead" | "user" | "manager" | "order" | "quotation" | "system";
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Record an immutable audit event in MongoDB.
 * Catches and logs errors without breaking primary execution flow.
 */
export async function logAuditEvent({
  actor,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
  userAgent,
}: LogActionParams): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      actor: actor?.id ? actor.id : null,
      actorName: actor?.name || "System",
      actorEmail: actor?.email || undefined,
      actorRole: actor?.role || "system",
      action,
      entityType,
      entityId,
      metadata,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}

export async function logAction(
  params: LogActionParams & { details?: string }
): Promise<void> {
  return logAuditEvent({
    ...params,
    metadata: params.metadata || (params.details ? { details: params.details } : undefined),
  });
}

