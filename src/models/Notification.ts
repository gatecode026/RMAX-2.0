import { Schema, model, models, type Model, type Types } from "mongoose";
import { NOTIFICATION_TYPES, type NotificationType } from "@/lib/enums";

export interface INotification {
  recipient?: Types.ObjectId | null;
  targetRole: "super_admin" | "manager" | "all";
  title: string;
  message: string;
  type: NotificationType;
  entityType: "lead" | "user" | "order" | "system";
  entityId?: string;
  link?: string;
  isRead: boolean;
  readAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", index: true, default: null },
    targetRole: { type: String, enum: ["super_admin", "manager", "all"], default: "all", index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true, index: true },
    entityType: { type: String, enum: ["lead", "user", "order", "system"], default: "lead" },
    entityId: { type: String, trim: true },
    link: { type: String, trim: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ targetRole: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  models.Notification || model<INotification>("Notification", notificationSchema);
