import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const unreadOnly = searchParams.get("unread") === "true";

    // Super Admins receive notifications explicitly targeted to them, or to "super_admin", or broadcast "all"
    // Managers receive notifications explicitly targeted to them, or to "manager", or broadcast "all"
    const roleTarget = user.role === "super_admin" || user.role === "admin" ? "super_admin" : "manager";

    const query: Record<string, unknown> = {
      $or: [
        { recipient: user.id },
        { targetRole: roleTarget },
        { targetRole: "all" },
      ],
    };

    if (unreadOnly) {
      query.isRead = false;
    }

    const [items, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({
        $or: [
          { recipient: user.id },
          { targetRole: roleTarget },
          { targetRole: "all" },
        ],
        isRead: false,
      }),
    ]);

    return NextResponse.json({
      notifications: items.map((n) => ({
        id: String(n._id),
        title: n.title,
        message: n.message,
        type: n.type,
        entityType: n.entityType,
        entityId: n.entityId,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { id, markAllAsRead } = body;

    const roleTarget = user.role === "super_admin" || user.role === "admin" ? "super_admin" : "manager";

    if (markAllAsRead) {
      await Notification.updateMany(
        {
          $or: [
            { recipient: user.id },
            { targetRole: roleTarget },
            { targetRole: "all" },
          ],
          isRead: false,
        },
        { $set: { isRead: true, readAt: new Date() } },
      );
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (id) {
      const notif = await Notification.findOne({
        _id: id,
        $or: [
          { recipient: user.id },
          { targetRole: roleTarget },
          { targetRole: "all" },
        ],
      });

      if (!notif) {
        return NextResponse.json({ error: "Notification not found or access denied" }, { status: 404 });
      }

      notif.isRead = true;
      notif.readAt = new Date();
      await notif.save();

      return NextResponse.json({ success: true, notification: notif });
    }

    return NextResponse.json({ error: "Missing notification id or markAllAsRead" }, { status: 400 });
  } catch (error) {
    console.error("Notifications update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
