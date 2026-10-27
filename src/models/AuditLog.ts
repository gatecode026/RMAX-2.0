import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IAuditLog {
  actor?: Types.ObjectId | null;
  actorName: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorName: { type: String, required: true, trim: true },
    actorEmail: { type: String, trim: true },
    actorRole: { type: String, trim: true },
    action: { type: String, required: true, trim: true, index: true },
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: String, trim: true, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

export const AuditLog: Model<IAuditLog> =
  models.AuditLog || model<IAuditLog>("AuditLog", auditLogSchema);
