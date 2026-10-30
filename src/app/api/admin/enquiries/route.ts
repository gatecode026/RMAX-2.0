import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { getSessionUser } from "@/lib/session";
import { logAction } from "@/lib/audit";

export async function GET() {
  try {
    const user = await getSessionUser("staff");
    if (!user || (user.role !== "super_admin" && user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();

    const enquiries = messages.map((m) => {
      const initials = (m.name || "Client")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      return {
        id: String(m._id),
        customerName: m.name,
        initials: initials || "CL",
        institution: m.enquiryType || "General Enquiry",
        timeAgo: new Date(m.createdAt || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        messagePreview: m.message,
        status: m.status === "answered" ? "resolved" : m.status === "closed" ? "resolved" : "new",
        date: new Date(m.createdAt || Date.now()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        email: m.email,
        phone: m.phone || "—",
        modelInterest: m.model || "General",
      };
    });

    return NextResponse.json({ success: true, enquiries });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load enquiries" },
      { status: 500 }
    );
  }
}
