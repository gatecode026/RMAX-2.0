import { connectDB } from "@/lib/mongodb";
import { AuditLog } from "@/models/AuditLog";
import type { SessionUser } from "@/lib/session";

export interface LogActionParams {
  actor?: SessionUser | null;
  action: string;
  entityType: "lead" | "product" | "inventory" | "user" | "manager" | "order" | "quotation" | "system" | string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Record an immutable audit event in MongoDB.
 * Captures who performed the action, exact timestamp, entity affected, and readable description.
 */
export async function logAuditEvent({
  actor,
  action,
  entityType,
  entityId,
  metadata = {},
  details,
  ipAddress,
  userAgent,
}: LogActionParams): Promise<void> {
  try {
    await connectDB();
    const finalMetadata: Record<string, unknown> = { ...metadata };
    if (details && !finalMetadata.details) {
      finalMetadata.details = details;
    }

    await AuditLog.create({
      actor: actor?.id ? actor.id : null,
      actorName: actor?.name || "System",
      actorEmail: actor?.email || undefined,
      actorRole: actor?.role || "system",
      action,
      entityType,
      entityId,
      metadata: finalMetadata,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}

export async function logAction(params: LogActionParams): Promise<void> {
  return logAuditEvent(params);
}
