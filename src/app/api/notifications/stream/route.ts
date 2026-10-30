import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/session";
import { notificationEmitter } from "@/lib/notifications";
import type { INotification } from "@/models/Notification";

export async function GET(req: NextRequest) {
  const user = await getSessionUser("staff");
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const roleTarget = user.role === "super_admin" || user.role === "admin" ? "super_admin" : "manager";
  const userId = user.id;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));

      const onNotification = (notif: INotification & { _id?: unknown }) => {
        try {
          const recId = notif.recipient ? String(notif.recipient) : null;
          const target = notif.targetRole || "all";

          // Deliver only if user is authorized recipient
          const isTargeted =
            recId === userId ||
            target === "all" ||
            target === roleTarget ||
            ((user.role === "super_admin" || user.role === "admin") && target === "super_admin");

          if (isTargeted) {
            const notifItem = {
              _id: notif._id ? String(notif._id) : String(Date.now()),
              id: notif._id ? String(notif._id) : String(Date.now()),
              title: notif.title,
              message: notif.message,
              type: notif.type,
              entityType: notif.entityType,
              entityId: notif.entityId,
              link: notif.link,
              read: false,
              isRead: false,
              createdAt: notif.createdAt || new Date(),
            };
            const jsonStr = JSON.stringify({
              type: "new_notification",
              notification: notifItem,
            });
            // Send standard message event so default EventSource.onmessage catches it
            controller.enqueue(encoder.encode(`data: ${jsonStr}\n\n`));
            // Also send named event for addEventListener("notification")
            controller.enqueue(encoder.encode(`event: notification\ndata: ${jsonStr}\n\n`));
          }
        } catch {
          // Stream might be closed
        }
      };

      notificationEmitter.on("notification", onNotification);

      // Periodic heartbeat to prevent timeout on proxies
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 20000);

      req.signal.addEventListener("abort", () => {
        notificationEmitter.off("notification", onNotification);
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
