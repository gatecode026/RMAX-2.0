import { EventEmitter } from "events";
import { connectDB } from "@/lib/mongodb";
import { Notification, type INotification } from "@/models/Notification";
import type { NotificationType } from "@/lib/enums";

// Global notification broker for in-process real-time Server-Sent Events (SSE)
declare global {
  var __notificationEmitter: EventEmitter | undefined;
}

export const notificationEmitter = globalThis.__notificationEmitter || new EventEmitter();
notificationEmitter.setMaxListeners(200);
globalThis.__notificationEmitter = notificationEmitter;

export interface CreateNotificationParams {
  recipientId?: string | null;
  targetRole?: "super_admin" | "manager" | "all";
  title: string;
  message: string;
  type: NotificationType;
  entityType?: "lead" | "user" | "order" | "system";
  entityId?: string;
  link?: string;
}

/**
 * Creates and persists a notification in MongoDB, then broadcasts to real-time subscribers.
 */
export async function createNotification(params: CreateNotificationParams): Promise<INotification | null> {
  try {
    await connectDB();
    const notif = await Notification.create({
      recipient: params.recipientId || null,
      targetRole: params.targetRole || "all",
      title: params.title,
      message: params.message,
      type: params.type,
      entityType: params.entityType || "lead",
      entityId: params.entityId,
      link: params.link,
      isRead: false,
    });

    const plain = notif.toObject();
    notificationEmitter.emit("notification", plain);
    return plain;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}
