import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/session";
import { notificationEmitter } from "@/lib/notifications";
import type { INotification } from "@/models/Notification";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const roleTarget = user.role === "super_admin" || user.role === "admin" ? "super_admin" : "manager";
  const userId = user.id;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial keep-alive ping
      controller.enqueue(encoder.encode(`event: ping\ndata: "connected"\n\n`));

      const onNotification = (notif: INotification & { _id?: unknown }) => {
        try {
          const recId = notif.recipient ? String(notif.recipient) : null;
          const target = notif.targetRole || "all";

          // Deliver only if user is authorized recipient
          const isTargeted =
            recId === userId ||
            target === "all" ||
            target === roleTarget;

          if (isTargeted) {
            const payload = {
              id: notif._id ? String(notif._id) : undefined,
              title: notif.title,
              message: notif.message,
              type: notif.type,
              entityType: notif.entityType,
              entityId: notif.entityId,
              link: notif.link,
              createdAt: notif.createdAt || new Date(),
            };
            controller.enqueue(encoder.encode(`event: notification\ndata: ${JSON.stringify(payload)}\n\n`));
          }
        } catch {
          // Stream might be closed
        }
      };

      notificationEmitter.on("notification", onNotification);

      // Periodic heartbeat to prevent timeout on proxies
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: "keep-alive"\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

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
