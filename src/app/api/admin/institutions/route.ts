import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Institution } from "@/models/Institution";
import { QuoteRequest } from "@/models/QuoteRequest";
import { getSessionUser } from "@/lib/session";
import { logAction } from "@/lib/audit";

export async function GET() {
  try {
    const user = await getSessionUser("staff");
    if (!user || (user.role !== "super_admin" && user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const [dbInstitutions, quotes] = await Promise.all([
      Institution.find().sort({ createdAt: -1 }).lean(),
      QuoteRequest.find().lean(),
    ]);

    // If explicit institutions are saved, return them
    // Also include any institutions from quotes that aren't yet in institutions table
    const instMap = new Map<string, any>();

    for (const inst of dbInstitutions) {
      instMap.set(inst.name.toLowerCase().trim(), {
        id: String(inst._id),
        name: inst.name,
        type: inst.type || "School",
        city: inst.city,
        state: inst.state,
        contactPerson: inst.contactPerson,
        email: inst.email,
        phone: inst.phone,
        unitsInstalled: inst.unitsInstalled || 1,
        status: inst.status || "Active",
      });
    }

    for (const q of quotes) {
      if (!q.organizationName) continue;
      const key = q.organizationName.toLowerCase().trim();
      if (!instMap.has(key)) {
        instMap.set(key, {
          id: `quote-inst-${String(q._id)}`,
          name: q.organizationName,
          type: q.institutionType || "School",
          city: q.deliveryCityPostal || "India",
          state: "",
          contactPerson: q.contactPerson || "",
          email: q.email || "",
          phone: q.phone || "",
          unitsInstalled: q.quantity || 1,
          status: q.status === "approved" ? "Active" : "Pending",
        });
      }
    }

    const institutions = Array.from(instMap.values());

    return NextResponse.json({ success: true, institutions });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load institutions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser("staff");
    if (!user || (user.role !== "super_admin" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Only Super Admin can add institutions" }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, city, state, contactPerson, email, phone, unitsInstalled } = body;

    if (!name || !city) {
      return NextResponse.json({ success: false, error: "Institution name and city are required" }, { status: 400 });
    }

    await connectDB();

    const created = await Institution.create({
      name,
      type: type || "School",
      city,
      state: state || "",
      contactPerson: contactPerson || "",
      email: email || "",
      phone: phone || "",
      unitsInstalled: Number(unitsInstalled) || 1,
      status: "Active",
    });

    await logAction({
      actor: user,
      action: "user_created",
      entityType: "user",
      entityId: String(created._id),
      details: `Added new institution ${name} (${city})`,
    });

    return NextResponse.json({ success: true, institution: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to add institution" },
      { status: 500 }
    );
  }
}
