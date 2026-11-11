import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProductBrand } from "@/models/ProductBrand";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  try {
    await connectDB();
    const brands = await ProductBrand.find().sort({ sortOrder: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, brands });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load brands" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await checkApiRole(["super_admin", "admin"]);
  if ("error" in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  const { user } = authResult;
  try {
    await connectDB();
    const body = await req.json();
    const name: string | undefined = body.name?.trim();
    if (!name) return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
    const slug = (body.slug?.trim() || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (await ProductBrand.exists({ slug })) {
      return NextResponse.json({ error: `A brand with slug "${slug}" already exists.` }, { status: 409 });
    }
    const created = await ProductBrand.create({
      name,
      slug,
      description: body.description?.trim(),
      logo: body.logo,
      sortOrder: Number(body.sortOrder) || 0,
      active: body.active ?? true,
    });
    await logAuditEvent({
      actor: user,
      action: "PRODUCT_BRAND_CREATED",
      entityType: "product_brand",
      entityId: String(created._id),
      metadata: { name: created.name, slug: created.slug },
    });
    return NextResponse.json({ success: true, brand: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create brand" }, { status: 500 });
  }
}
