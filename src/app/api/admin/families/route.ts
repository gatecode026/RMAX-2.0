import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductFamily } from "@/models/ProductFamily";
import { checkApiRole } from "@/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { normaliseOptions, slugifyKey } from "@/lib/admin/family";

/** GET /api/admin/families — every family with its member products (any status), for the product form. */
export async function GET() {
  const auth = await checkApiRole(["super_admin", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    await connectDB();
    const [families, members] = await Promise.all([
      ProductFamily.find().sort({ sortOrder: 1, name: 1 }).lean(),
      Product.find({ familyId: { $exists: true } }, { name: 1, slug: 1, status: 1, familyId: 1, variantOptions: 1 }).lean(),
    ]);
    return NextResponse.json({
      success: true,
      families: families.map((f) => ({ ...f, members: members.filter((m) => String(m.familyId) === String(f._id)) })),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed to load families" }, { status: 500 });
  }
}

/** POST /api/admin/families — { name, slug?, options: [{ label, values: [{ label }] }] }. */
export async function POST(req: NextRequest) {
  const auth = await checkApiRole(["super_admin", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Family name is required." }, { status: 400 });
    const slug = slugifyKey(String(body.slug ?? "") || name);
    if (!slug) return NextResponse.json({ error: "Could not derive a slug." }, { status: 400 });
    const opts = normaliseOptions(body.options);
    if ("error" in opts) return NextResponse.json({ error: opts.error }, { status: 400 });

    await connectDB();
    // A family URL (/products/<slug>) must not shadow a product.
    if ((await ProductFamily.exists({ slug })) || (await Product.exists({ slug }))) {
      return NextResponse.json({ error: `"${slug}" is already used by a product or family.` }, { status: 409 });
    }
    const family = await ProductFamily.create({ name, slug, options: opts.options, sortOrder: Date.now() });
    await logAuditEvent({
      actor: auth.user,
      action: "PRODUCT_UPDATED",
      entityType: "product",
      entityId: String(family._id),
      metadata: { details: `${auth.user.name} created product family "${name}"` },
    });
    try {
      revalidateTag("products", { expire: 0 });
    } catch {}
    return NextResponse.json({ success: true, family }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed to create family" }, { status: 500 });
  }
}
